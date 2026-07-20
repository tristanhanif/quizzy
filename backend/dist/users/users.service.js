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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const firebase_service_1 = require("../firebase/firebase.service");
let UsersService = class UsersService {
    constructor(firebaseService) {
        this.firebaseService = firebaseService;
    }
    get usersRef() {
        return this.firebaseService.firestore.collection('users');
    }
    get mutualsRef() {
        return this.firebaseService.firestore.collection('user_mutuals');
    }
    async searchByDisplayId(displayId) {
        const snapshot = await this.usersRef
            .where('displayId', '==', displayId.toUpperCase())
            .limit(1)
            .get();
        if (snapshot.empty) {
            throw new common_1.NotFoundException('User not found');
        }
        const doc = snapshot.docs[0];
        const data = doc.data();
        return {
            id: doc.id,
            name: data.fullName,
            displayId: data.displayId,
            role: data.role,
            email: data.email,
            picture: data.googlePicture || null,
            provider: data.provider,
            createdAt: data.createdAt,
        };
    }
    async getUserProfile(displayId) {
        const snapshot = await this.usersRef
            .where('displayId', '==', displayId.toUpperCase())
            .limit(1)
            .get();
        if (snapshot.empty) {
            throw new common_1.NotFoundException('User not found');
        }
        const doc = snapshot.docs[0];
        const data = doc.data();
        return {
            id: doc.id,
            name: data.fullName,
            displayId: data.displayId,
            role: data.role,
            email: data.email,
            picture: data.googlePicture || null,
            provider: data.provider,
            createdAt: data.createdAt,
        };
    }
    async sendMutualRequest(senderId, targetDisplayId) {
        if (!targetDisplayId) {
            throw new common_1.BadRequestException('Target display ID is required');
        }
        const senderDoc = await this.usersRef.doc(senderId).get();
        if (!senderDoc.exists) {
            throw new common_1.NotFoundException('Sender not found');
        }
        const senderData = senderDoc.data();
        if (senderData.role !== 'PARTICIPANT') {
            throw new common_1.BadRequestException('Only participants can add friends');
        }
        const targetSnapshot = await this.usersRef
            .where('displayId', '==', targetDisplayId.toUpperCase())
            .limit(1)
            .get();
        if (targetSnapshot.empty) {
            throw new common_1.NotFoundException('Target user not found');
        }
        const targetDoc = targetSnapshot.docs[0];
        const targetUserId = targetDoc.id;
        const targetData = targetDoc.data();
        if (senderId === targetUserId) {
            throw new common_1.BadRequestException('Cannot send mutual request to yourself');
        }
        if (targetData.role !== 'PARTICIPANT') {
            throw new common_1.BadRequestException('Only participants can add friends');
        }
        const existing = await this.mutualsRef
            .where('participants', 'array-contains', senderId)
            .get();
        const alreadyMutual = existing.docs.some((doc) => {
            const data = doc.data();
            return (data.participants.includes(targetUserId) &&
                (data.status === 'pending' || data.status === 'accepted'));
        });
        if (alreadyMutual) {
            throw new common_1.BadRequestException('Mutual request already exists or already mutual');
        }
        const mutualRef = await this.mutualsRef.add({
            participants: [senderId, targetUserId],
            requestedBy: senderId,
            status: 'pending',
            createdAt: new Date(),
            updatedAt: new Date(),
        });
        return { id: mutualRef.id, message: 'Mutual request sent' };
    }
    async acceptMutualRequest(userId, mutualId) {
        const userDoc = await this.usersRef.doc(userId).get();
        if (!userDoc.exists || userDoc.data().role !== 'PARTICIPANT') {
            throw new common_1.BadRequestException('Only participants can manage friend requests');
        }
        const mutualDoc = await this.mutualsRef.doc(mutualId).get();
        if (!mutualDoc.exists) {
            throw new common_1.NotFoundException('Mutual request not found');
        }
        const mutualData = mutualDoc.data();
        if (!mutualData.participants.includes(userId)) {
            throw new common_1.BadRequestException('Not authorized to accept this request');
        }
        if (mutualData.requestedBy === userId) {
            throw new common_1.BadRequestException('Cannot accept your own request');
        }
        if (mutualData.status !== 'pending') {
            throw new common_1.BadRequestException('Request already processed');
        }
        await mutualDoc.ref.update({
            status: 'accepted',
            updatedAt: new Date(),
        });
        return { message: 'Mutual request accepted' };
    }
    async declineMutualRequest(userId, mutualId) {
        const userDoc = await this.usersRef.doc(userId).get();
        if (!userDoc.exists || userDoc.data().role !== 'PARTICIPANT') {
            throw new common_1.BadRequestException('Only participants can manage friend requests');
        }
        const mutualDoc = await this.mutualsRef.doc(mutualId).get();
        if (!mutualDoc.exists) {
            throw new common_1.NotFoundException('Mutual request not found');
        }
        const mutualData = mutualDoc.data();
        if (!mutualData.participants.includes(userId)) {
            throw new common_1.BadRequestException('Not authorized');
        }
        await mutualDoc.ref.update({
            status: 'declined',
            updatedAt: new Date(),
        });
        return { message: 'Mutual request declined' };
    }
    async removeMutual(userId, mutualId) {
        const userDoc = await this.usersRef.doc(userId).get();
        if (!userDoc.exists || userDoc.data().role !== 'PARTICIPANT') {
            throw new common_1.BadRequestException('Only participants can manage friends');
        }
        const mutualDoc = await this.mutualsRef.doc(mutualId).get();
        if (!mutualDoc.exists) {
            throw new common_1.NotFoundException('Mutual not found');
        }
        const mutualData = mutualDoc.data();
        if (!mutualData.participants.includes(userId)) {
            throw new common_1.BadRequestException('Not authorized');
        }
        await mutualDoc.ref.delete();
        return { message: 'Mutual removed' };
    }
    async getMutualStatus(userId, targetUserId) {
        const snapshot = await this.mutualsRef
            .where('participants', 'array-contains', userId)
            .get();
        const mutual = snapshot.docs.find((doc) => {
            const data = doc.data();
            return data.participants.includes(targetUserId);
        });
        if (!mutual) {
            return { status: 'none', mutualId: null };
        }
        const data = mutual.data();
        return {
            status: data.status,
            mutualId: mutual.id,
            requestedBy: data.requestedBy,
        };
    }
    async getMyMutuals(userId) {
        const snapshot = await this.mutualsRef
            .where('participants', 'array-contains', userId)
            .where('status', '==', 'accepted')
            .get();
        const mutualIds = [];
        for (const doc of snapshot.docs) {
            const data = doc.data();
            const otherId = data.participants.find((p) => p !== userId);
            if (otherId)
                mutualIds.push(otherId);
        }
        if (mutualIds.length === 0) {
            return { data: [] };
        }
        const usersSnapshot = await this.usersRef.get();
        const mutualUsers = usersSnapshot.docs
            .filter((doc) => mutualIds.includes(doc.id))
            .map((doc) => {
            const data = doc.data();
            return {
                id: doc.id,
                name: data.fullName,
                displayId: data.displayId,
                role: data.role,
                picture: data.googlePicture || null,
            };
        });
        return { data: mutualUsers };
    }
    async getPendingMutuals(userId) {
        const snapshot = await this.mutualsRef
            .where('participants', 'array-contains', userId)
            .where('status', '==', 'pending')
            .get();
        const pending = snapshot.docs
            .filter((doc) => doc.data().requestedBy !== userId)
            .map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));
        return { data: pending };
    }
    async getMutualCount(userId) {
        const snapshot = await this.mutualsRef
            .where('participants', 'array-contains', userId)
            .where('status', '==', 'accepted')
            .get();
        return snapshot.size;
    }
    async updateProfile(userId, dto) {
        const userDoc = await this.usersRef.doc(userId).get();
        if (!userDoc.exists) {
            throw new common_1.NotFoundException('User not found');
        }
        const updateData = { updatedAt: new Date() };
        if (dto.fullName !== undefined) {
            const trimmed = dto.fullName.trim();
            if (trimmed.length < 2) {
                throw new common_1.BadRequestException('Name must be at least 2 characters');
            }
            updateData.fullName = trimmed;
        }
        if (dto.picture !== undefined) {
            updateData.googlePicture = dto.picture || null;
        }
        await userDoc.ref.update(updateData);
        const updated = await this.usersRef.doc(userId).get();
        const data = updated.data();
        return {
            id: updated.id,
            name: data.fullName,
            displayId: data.displayId,
            role: data.role,
            email: data.email,
            picture: data.googlePicture || null,
            provider: data.provider,
        };
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [firebase_service_1.FirebaseService])
], UsersService);
//# sourceMappingURL=users.service.js.map