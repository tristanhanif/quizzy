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
exports.AdminService = void 0;
const common_1 = require("@nestjs/common");
const firebase_service_1 = require("../firebase/firebase.service");
let AdminService = class AdminService {
    constructor(firebaseService) {
        this.firebaseService = firebaseService;
    }
    get usersRef() {
        return this.firebaseService.firestore.collection('users');
    }
    async getAllUsers() {
        const snapshot = await this.usersRef.orderBy('createdAt', 'desc').get();
        return {
            data: snapshot.docs.map((doc) => {
                const data = doc.data();
                return {
                    id: doc.id,
                    name: data.fullName,
                    email: data.email,
                    role: data.role,
                    displayId: data.displayId,
                    provider: data.provider,
                    createdAt: data.createdAt,
                };
            }),
        };
    }
    async getStats() {
        const usersSnapshot = await this.usersRef.get();
        const categoriesSnapshot = await this.firebaseService.firestore
            .collection('categories')
            .get();
        const quizzesSnapshot = await this.firebaseService.firestore
            .collection('quizzes')
            .get();
        const sessionsSnapshot = await this.firebaseService.firestore
            .collection('sessions')
            .get();
        const users = usersSnapshot.docs.map((doc) => doc.data());
        return {
            totalUsers: usersSnapshot.size,
            totalCategories: categoriesSnapshot.size,
            totalQuizzes: quizzesSnapshot.size,
            totalSessions: sessionsSnapshot.size,
            usersByRole: {
                admin: users.filter((u) => u.role === 'ADMIN').length,
                creator: users.filter((u) => u.role === 'CREATOR').length,
                participant: users.filter((u) => u.role === 'PARTICIPANT').length,
            },
        };
    }
    async updateUserRole(userId, role) {
        const userDoc = await this.usersRef.doc(userId).get();
        if (!userDoc.exists) {
            return { error: 'User not found' };
        }
        await userDoc.ref.update({
            role,
            updatedAt: new Date(),
        });
        return { message: `User role updated to ${role}` };
    }
    async getAllQuizzes() {
        const snapshot = await this.firebaseService.firestore
            .collection('quizzes')
            .orderBy('createdAt', 'desc')
            .get();
        const quizzes = await Promise.all(snapshot.docs.map(async (doc) => {
            const data = doc.data();
            let creatorName = '';
            try {
                const creatorDoc = await this.firebaseService.firestore
                    .collection('users')
                    .doc(data.creatorId)
                    .get();
                if (creatorDoc.exists) {
                    creatorName = creatorDoc.data()?.fullName || '';
                }
            }
            catch { }
            return {
                id: doc.id,
                title: data.title,
                description: data.description,
                creatorId: data.creatorId,
                creatorName,
                questionCount: data.questions?.length || 0,
                isPublic: data.isPublic !== false,
                createdAt: data.createdAt,
            };
        }));
        return { data: quizzes };
    }
    async forceDeleteQuiz(quizId) {
        const quizDoc = await this.firebaseService.firestore
            .collection('quizzes')
            .doc(quizId)
            .get();
        if (!quizDoc.exists) {
            throw new Error('Quiz not found');
        }
        await quizDoc.ref.delete();
        return { message: 'Quiz deleted successfully' };
    }
    async deleteUser(userId) {
        const userDoc = await this.firebaseService.firestore
            .collection('users')
            .doc(userId)
            .get();
        if (!userDoc.exists) {
            throw new Error('User not found');
        }
        const userData = userDoc.data();
        if (userData.role === 'ADMIN') {
            throw new Error('Cannot delete admin users');
        }
        await userDoc.ref.delete();
        try {
            await this.firebaseService.auth.deleteUser(userId);
        }
        catch { }
        return { message: 'User deleted successfully' };
    }
    async getMaintenanceMode() {
        const doc = await this.firebaseService.firestore
            .collection('system_config')
            .doc('maintenance')
            .get();
        return { enabled: doc.exists ? doc.data()?.enabled || false : false };
    }
    async toggleMaintenanceMode(enabled) {
        await this.firebaseService.firestore
            .collection('system_config')
            .doc('maintenance')
            .set({ enabled, updatedAt: new Date() }, { merge: true });
        return { message: `Maintenance mode ${enabled ? 'enabled' : 'disabled'}`, enabled };
    }
    async getActiveSessions() {
        const snapshot = await this.firebaseService.firestore
            .collection('quiz_sessions')
            .where('status', '==', 'LIVE')
            .get();
        return { count: snapshot.size };
    }
    async sendBroadcast(message) {
        await this.firebaseService.firestore
            .collection('system_config')
            .doc('broadcast')
            .set({ message, createdAt: new Date(), active: true }, { merge: true });
        return { message: 'Broadcast sent successfully' };
    }
    async getBroadcast() {
        const doc = await this.firebaseService.firestore
            .collection('system_config')
            .doc('broadcast')
            .get();
        if (!doc.exists || !doc.data()?.active) {
            return { active: false, message: '' };
        }
        return { active: true, message: doc.data()?.message || '' };
    }
    async clearBroadcast() {
        await this.firebaseService.firestore
            .collection('system_config')
            .doc('broadcast')
            .set({ active: false, message: '' }, { merge: true });
        return { message: 'Broadcast cleared' };
    }
};
exports.AdminService = AdminService;
exports.AdminService = AdminService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [firebase_service_1.FirebaseService])
], AdminService);
//# sourceMappingURL=admin.service.js.map