"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SessionsService = void 0;
const common_1 = require("@nestjs/common");
const firebase_service_1 = require("../firebase/firebase.service");
const create_session_dto_1 = require("./dto/create-session.dto");
let SessionsService = class SessionsService {
    constructor(firebaseService) {
        this.firebaseService = firebaseService;
    }
    generateRoomCode() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let code = '';
        for (let i = 0; i < 6; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return code;
    }
    async create(createSessionDto, creatorId) {
        const { quizId, maxParticipants, questionTimeLimit, endTime } = createSessionDto;
        const quizDoc = await this.firebaseService.firestore
            .collection('quizzes')
            .doc(quizId)
            .get();
        if (!quizDoc.exists) {
            throw new common_1.NotFoundException('Quiz not found');
        }
        const quizData = quizDoc.data();
        if (quizData.creatorId !== creatorId) {
            throw new common_1.ForbiddenException('You can only create sessions for your own quizzes');
        }
        let roomCode = this.generateRoomCode();
        let isCodeUnique = false;
        while (!isCodeUnique) {
            const existingSession = await this.firebaseService.firestore
                .collection('quiz_sessions')
                .where('roomCode', '==', roomCode)
                .get();
            if (existingSession.empty) {
                isCodeUnique = true;
            }
            else {
                roomCode = this.generateRoomCode();
            }
        }
        const sessionData = {
            quizId,
            creatorId,
            roomCode,
            status: create_session_dto_1.SessionStatus.WAITING,
            currentQuestionIndex: 0,
            maxParticipants: maxParticipants || 50,
            questionTimeLimit: questionTimeLimit || 30,
            participants: [],
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        if (endTime) {
            sessionData.endTime = new Date(endTime);
        }
        const docRef = await this.firebaseService.firestore
            .collection('quiz_sessions')
            .add(sessionData);
        return {
            sessionId: docRef.id,
            roomCode,
        };
    }
    async join(joinSessionDto, userId) {
        const { roomCode } = joinSessionDto;
        const sessionsRef = this.firebaseService.firestore.collection('quiz_sessions');
        const snapshot = await sessionsRef.where('roomCode', '==', roomCode).get();
        if (snapshot.empty) {
            throw new common_1.NotFoundException('Session not found');
        }
        const sessionDoc = snapshot.docs[0];
        const sessionData = sessionDoc.data();
        if (sessionData.status === create_session_dto_1.SessionStatus.FINISHED) {
            throw new common_1.BadRequestException('Session has already ended');
        }
        if (sessionData.participants.includes(userId)) {
            throw new common_1.BadRequestException('You are already in this session');
        }
        if (sessionData.participants.length >= sessionData.maxParticipants) {
            throw new common_1.BadRequestException('Session is full');
        }
        await this.firebaseService.firestore
            .collection('quiz_sessions')
            .doc(sessionDoc.id)
            .update({
            participants: [...sessionData.participants, userId],
            updatedAt: new Date(),
        });
        await this.firebaseService.firestore
            .collection('quiz_sessions')
            .doc(sessionDoc.id)
            .collection('participants')
            .doc(userId)
            .set({
            userId,
            joinedAt: new Date(),
            score: 0,
            answers: [],
        });
        return {
            isValid: true,
            sessionId: sessionDoc.id,
            websocketUrl: `ws://localhost:3000/participant`,
        };
    }
    async findOne(id) {
        const sessionDoc = await this.firebaseService.firestore
            .collection('quiz_sessions')
            .doc(id)
            .get();
        if (!sessionDoc.exists) {
            throw new common_1.NotFoundException('Session not found');
        }
        const data = sessionDoc.data();
        return {
            id: sessionDoc.id,
            ...data,
        };
    }
    async findByRoomCode(roomCode) {
        const snapshot = await this.firebaseService.firestore
            .collection('quiz_sessions')
            .where('roomCode', '==', roomCode)
            .get();
        if (snapshot.empty) {
            throw new common_1.NotFoundException('Session not found');
        }
        const sessionDoc = snapshot.docs[0];
        const data = sessionDoc.data();
        return {
            id: sessionDoc.id,
            ...data,
        };
    }
    async getParticipants(sessionId) {
        const participantsSnapshot = await this.firebaseService.firestore
            .collection('quiz_sessions')
            .doc(sessionId)
            .collection('participants')
            .get();
        return {
            data: participantsSnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            })),
        };
    }
    async updateStatus(sessionId, status) {
        await this.firebaseService.firestore
            .collection('quiz_sessions')
            .doc(sessionId)
            .update({
            status,
            updatedAt: new Date(),
        });
        return {
            message: `Session status updated to ${status}`,
        };
    }
    async updateCurrentQuestion(sessionId, questionIndex) {
        const sessionDoc = await this.firebaseService.firestore
            .collection('quiz_sessions')
            .doc(sessionId)
            .get();
        const sessionData = sessionDoc.data();
        const timeLimit = sessionData?.questionTimeLimit || 30;
        const endTime = new Date(Date.now() + timeLimit * 1000);
        await this.firebaseService.firestore
            .collection('quiz_sessions')
            .doc(sessionId)
            .update({
            currentQuestionIndex: questionIndex,
            endTime,
            updatedAt: new Date(),
        });
        return {
            message: `Current question updated to index ${questionIndex}`,
            endTime: endTime.toISOString(),
        };
    }
    async setEndTime(sessionId, endTime) {
        await this.firebaseService.firestore
            .collection('quiz_sessions')
            .doc(sessionId)
            .update({
            endTime,
            updatedAt: new Date(),
        });
        return {
            message: 'End time updated',
            endTime: endTime.toISOString(),
        };
    }
};
exports.SessionsService = SessionsService;
exports.SessionsService = SessionsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [firebase_service_1.FirebaseService])
], SessionsService);
//# sourceMappingURL=sessions.service.js.map