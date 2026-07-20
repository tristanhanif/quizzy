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
exports.ResultsService = void 0;
const common_1 = require("@nestjs/common");
const firebase_service_1 = require("../firebase/firebase.service");
let ResultsService = class ResultsService {
    constructor(firebaseService) {
        this.firebaseService = firebaseService;
    }
    async submitResult(submitResultDto, participantId) {
        const { sessionId, totalScore, answers } = submitResultDto;
        const sessionDoc = await this.firebaseService.firestore
            .collection('quiz_sessions')
            .doc(sessionId)
            .get();
        if (!sessionDoc.exists) {
            throw new common_1.NotFoundException('Session not found');
        }
        const sessionData = sessionDoc.data();
        if (!sessionData.participants.includes(participantId)) {
            throw new common_1.BadRequestException('You are not a participant in this session');
        }
        const existingResult = await this.firebaseService.firestore
            .collection('quiz_results')
            .where('sessionId', '==', sessionId)
            .where('participantId', '==', participantId)
            .get();
        if (!existingResult.empty) {
            throw new common_1.BadRequestException('You have already submitted results for this session');
        }
        const participantDoc = await this.firebaseService.firestore
            .collection('quiz_sessions')
            .doc(sessionId)
            .collection('participants')
            .doc(participantId)
            .get();
        let participantName = 'Unknown';
        if (participantDoc.exists) {
            const participantData = participantDoc.data();
            participantName = participantData.fullName || participantData.name || 'Unknown';
        }
        const resultRef = this.firebaseService.firestore
            .collection('quiz_results')
            .doc();
        const participantRef = this.firebaseService.firestore
            .collection('quiz_sessions')
            .doc(sessionId)
            .collection('participants')
            .doc(participantId);
        await this.firebaseService.firestore.runTransaction(async (transaction) => {
            const resultData = {
                sessionId,
                participantId,
                participantName,
                score: totalScore,
                answers,
                submittedAt: new Date(),
            };
            transaction.set(resultRef, resultData);
            transaction.update(participantRef, {
                score: totalScore,
                answers,
                submittedAt: new Date(),
            });
        });
        return {
            id: resultRef.id,
            message: 'Results submitted successfully',
        };
    }
    async getLeaderboard(sessionId, limit = 10) {
        const resultsSnapshot = await this.firebaseService.firestore
            .collection('quiz_results')
            .where('sessionId', '==', sessionId)
            .get();
        const entries = resultsSnapshot.docs.map((doc) => ({
            participantId: doc.data().participantId,
            participantName: doc.data().participantName,
            score: doc.data().score,
        }));
        entries.sort((a, b) => b.score - a.score);
        const leaderboard = entries
            .slice(0, limit)
            .map((entry, index) => ({
            ...entry,
            rank: index + 1,
        }));
        return {
            data: leaderboard,
        };
    }
    async getSessionResults(sessionId) {
        const resultsSnapshot = await this.firebaseService.firestore
            .collection('quiz_results')
            .where('sessionId', '==', sessionId)
            .get();
        const results = resultsSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));
        results.sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
        return { data: results };
    }
    async getUserResults(userId) {
        const resultsSnapshot = await this.firebaseService.firestore
            .collection('quiz_results')
            .where('participantId', '==', userId)
            .get();
        const results = resultsSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));
        results.sort((a, b) => {
            const dateA = a.submittedAt?.toDate?.() ?? new Date(a.submittedAt ?? 0);
            const dateB = b.submittedAt?.toDate?.() ?? new Date(b.submittedAt ?? 0);
            return dateB.getTime() - dateA.getTime();
        });
        return { data: results };
    }
    async getResultById(resultId) {
        const resultDoc = await this.firebaseService.firestore
            .collection('quiz_results')
            .doc(resultId)
            .get();
        if (!resultDoc.exists) {
            throw new common_1.NotFoundException('Result not found');
        }
        return {
            id: resultDoc.id,
            ...resultDoc.data(),
        };
    }
};
exports.ResultsService = ResultsService;
exports.ResultsService = ResultsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [firebase_service_1.FirebaseService])
], ResultsService);
//# sourceMappingURL=results.service.js.map