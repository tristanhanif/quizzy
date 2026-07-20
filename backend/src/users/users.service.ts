import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';

@Injectable()
export class UsersService {
  constructor(private readonly firebaseService: FirebaseService) {}

  private get usersRef() {
    return this.firebaseService.firestore.collection('users');
  }

  private get mutualsRef() {
    return this.firebaseService.firestore.collection('user_mutuals');
  }

  async searchByDisplayId(displayId: string) {
    const snapshot = await this.usersRef
      .where('displayId', '==', displayId.toUpperCase())
      .limit(1)
      .get();

    if (snapshot.empty) {
      throw new NotFoundException('User not found');
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

  async getUserProfile(displayId: string) {
    const snapshot = await this.usersRef
      .where('displayId', '==', displayId.toUpperCase())
      .limit(1)
      .get();

    if (snapshot.empty) {
      throw new NotFoundException('User not found');
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

  async sendMutualRequest(senderId: string, targetDisplayId: string) {
    if (!targetDisplayId) {
      throw new BadRequestException('Target display ID is required');
    }

    const senderDoc = await this.usersRef.doc(senderId).get();
    if (!senderDoc.exists) {
      throw new NotFoundException('Sender not found');
    }
    const senderData = senderDoc.data();
    if (senderData.role !== 'PARTICIPANT') {
      throw new BadRequestException('Only participants can add friends');
    }

    const targetSnapshot = await this.usersRef
      .where('displayId', '==', targetDisplayId.toUpperCase())
      .limit(1)
      .get();

    if (targetSnapshot.empty) {
      throw new NotFoundException('Target user not found');
    }

    const targetDoc = targetSnapshot.docs[0];
    const targetUserId = targetDoc.id;
    const targetData = targetDoc.data();

    if (senderId === targetUserId) {
      throw new BadRequestException('Cannot send mutual request to yourself');
    }

    if (targetData.role !== 'PARTICIPANT') {
      throw new BadRequestException('Only participants can add friends');
    }

    const existing = await this.mutualsRef
      .where('participants', 'array-contains', senderId)
      .get();

    const alreadyMutual = existing.docs.some((doc) => {
      const data = doc.data();
      return (
        data.participants.includes(targetUserId) &&
        (data.status === 'pending' || data.status === 'accepted')
      );
    });

    if (alreadyMutual) {
      throw new BadRequestException('Mutual request already exists or already mutual');
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

  async acceptMutualRequest(userId: string, mutualId: string) {
    const userDoc = await this.usersRef.doc(userId).get();
    if (!userDoc.exists || userDoc.data().role !== 'PARTICIPANT') {
      throw new BadRequestException('Only participants can manage friend requests');
    }

    const mutualDoc = await this.mutualsRef.doc(mutualId).get();
    if (!mutualDoc.exists) {
      throw new NotFoundException('Mutual request not found');
    }

    const mutualData = mutualDoc.data();

    if (!mutualData.participants.includes(userId)) {
      throw new BadRequestException('Not authorized to accept this request');
    }

    if (mutualData.requestedBy === userId) {
      throw new BadRequestException('Cannot accept your own request');
    }

    if (mutualData.status !== 'pending') {
      throw new BadRequestException('Request already processed');
    }

    await mutualDoc.ref.update({
      status: 'accepted',
      updatedAt: new Date(),
    });

    return { message: 'Mutual request accepted' };
  }

  async declineMutualRequest(userId: string, mutualId: string) {
    const userDoc = await this.usersRef.doc(userId).get();
    if (!userDoc.exists || userDoc.data().role !== 'PARTICIPANT') {
      throw new BadRequestException('Only participants can manage friend requests');
    }

    const mutualDoc = await this.mutualsRef.doc(mutualId).get();
    if (!mutualDoc.exists) {
      throw new NotFoundException('Mutual request not found');
    }

    const mutualData = mutualDoc.data();

    if (!mutualData.participants.includes(userId)) {
      throw new BadRequestException('Not authorized');
    }

    await mutualDoc.ref.update({
      status: 'declined',
      updatedAt: new Date(),
    });

    return { message: 'Mutual request declined' };
  }

  async removeMutual(userId: string, mutualId: string) {
    const userDoc = await this.usersRef.doc(userId).get();
    if (!userDoc.exists || userDoc.data().role !== 'PARTICIPANT') {
      throw new BadRequestException('Only participants can manage friends');
    }

    const mutualDoc = await this.mutualsRef.doc(mutualId).get();
    if (!mutualDoc.exists) {
      throw new NotFoundException('Mutual not found');
    }

    const mutualData = mutualDoc.data();

    if (!mutualData.participants.includes(userId)) {
      throw new BadRequestException('Not authorized');
    }

    await mutualDoc.ref.delete();

    return { message: 'Mutual removed' };
  }

  async getMutualStatus(userId: string, targetUserId: string) {
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

  async getMyMutuals(userId: string) {
    const snapshot = await this.mutualsRef
      .where('participants', 'array-contains', userId)
      .where('status', '==', 'accepted')
      .get();

    const mutualIds: string[] = [];
    for (const doc of snapshot.docs) {
      const data = doc.data();
      const otherId = data.participants.find((p: string) => p !== userId);
      if (otherId) mutualIds.push(otherId);
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

  async getPendingMutuals(userId: string) {
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

  async getMutualCount(userId: string): Promise<number> {
    const snapshot = await this.mutualsRef
      .where('participants', 'array-contains', userId)
      .where('status', '==', 'accepted')
      .get();

    return snapshot.size;
  }

  async updateProfile(userId: string, dto: { fullName?: string; picture?: string }) {
    const userDoc = await this.usersRef.doc(userId).get();

    if (!userDoc.exists) {
      throw new NotFoundException('User not found');
    }

    const updateData: Record<string, any> = { updatedAt: new Date() };

    if (dto.fullName !== undefined) {
      const trimmed = dto.fullName.trim();
      if (trimmed.length < 2) {
        throw new BadRequestException('Name must be at least 2 characters');
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
}
