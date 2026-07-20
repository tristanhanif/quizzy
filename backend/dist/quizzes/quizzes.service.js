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
exports.QuizzesService = void 0;
const common_1 = require("@nestjs/common");
const firebase_service_1 = require("../firebase/firebase.service");
let QuizzesService = class QuizzesService {
    constructor(firebaseService) {
        this.firebaseService = firebaseService;
    }
    async create(createQuizDto, creatorId) {
        const quizRef = this.firebaseService.firestore.collection('quizzes');
        const questions = createQuizDto.questions.map((q, index) => ({
            questionId: `q${index + 1}`,
            ...q,
        }));
        const quizData = {
            creatorId,
            title: createQuizDto.title,
            description: createQuizDto.description,
            isPublic: createQuizDto.isPublic ?? true,
            questions,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        const docRef = await quizRef.add(quizData);
        return {
            id: docRef.id,
            message: 'Quiz created successfully',
        };
    }
    async findAll() {
        const quizzesRef = this.firebaseService.firestore.collection('quizzes');
        const snapshot = await quizzesRef.get();
        return {
            data: snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            })),
        };
    }
    async findOne(id) {
        const quizDoc = await this.firebaseService.firestore
            .collection('quizzes')
            .doc(id)
            .get();
        if (!quizDoc.exists) {
            throw new common_1.NotFoundException('Quiz not found');
        }
        const data = quizDoc.data();
        return {
            id: quizDoc.id,
            ...data,
        };
    }
    async update(id, updateQuizDto, userId) {
        const quizDoc = await this.firebaseService.firestore
            .collection('quizzes')
            .doc(id)
            .get();
        if (!quizDoc.exists) {
            throw new common_1.NotFoundException('Quiz not found');
        }
        const quizData = quizDoc.data();
        if (quizData.creatorId !== userId) {
            throw new common_1.ForbiddenException('You can only update your own quizzes');
        }
        const updateData = {
            updatedAt: new Date(),
        };
        if (updateQuizDto.title)
            updateData.title = updateQuizDto.title;
        if (updateQuizDto.description)
            updateData.description = updateQuizDto.description;
        if (updateQuizDto.isPublic !== undefined)
            updateData.isPublic = updateQuizDto.isPublic;
        if (updateQuizDto.questions)
            updateData.questions = updateQuizDto.questions;
        await this.firebaseService.firestore.collection('quizzes').doc(id).update(updateData);
        return {
            id,
            message: 'Quiz updated successfully',
        };
    }
    async remove(id, userId) {
        const quizDoc = await this.firebaseService.firestore
            .collection('quizzes')
            .doc(id)
            .get();
        if (!quizDoc.exists) {
            throw new common_1.NotFoundException('Quiz not found');
        }
        const quizData = quizDoc.data();
        if (quizData.creatorId !== userId) {
            throw new common_1.ForbiddenException('You can only delete your own quizzes');
        }
        await this.firebaseService.firestore.collection('quizzes').doc(id).delete();
        return {
            message: 'Quiz deleted successfully',
        };
    }
    async findByCreator(creatorId) {
        const quizzesRef = this.firebaseService.firestore.collection('quizzes');
        const snapshot = await quizzesRef
            .where('creatorId', '==', creatorId)
            .get();
        return {
            data: snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            })),
        };
    }
};
exports.QuizzesService = QuizzesService;
exports.QuizzesService = QuizzesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [firebase_service_1.FirebaseService])
], QuizzesService);
//# sourceMappingURL=quizzes.service.js.map