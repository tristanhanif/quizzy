import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';
import { SubmitResultDto, LeaderboardEntry } from './dto/submit-result.dto';

@Injectable()
export class ResultsService {
  constructor(private readonly firebaseService: FirebaseService) {}

  async submitResult(submitResultDto: SubmitResultDto, participantId: string) {
    const { sessionId, totalScore, answers } = submitResultDto;

    const sessionDoc = await this.firebaseService.firestore
      .collection('quiz_sessions')
      .doc(sessionId)
      .get();

    if (!sessionDoc.exists) {
      throw new NotFoundException('Session not found');
    }

    const sessionData = sessionDoc.data();

    if (!sessionData.participants.includes(participantId)) {
      throw new BadRequestException('You are not a participant in this session');
    }

    const existingResult = await this.firebaseService.firestore
      .collection('quiz_results')
      .where('sessionId', '==', sessionId)
      .where('participantId', '==', participantId)
      .get();

    if (!existingResult.empty) {
      throw new BadRequestException('You have already submitted results for this session');
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

  async getLeaderboard(sessionId: string, limit: number = 10) {
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

    const leaderboard: LeaderboardEntry[] = entries
      .slice(0, limit)
      .map((entry, index) => ({
        ...entry,
        rank: index + 1,
      }));

    return {
      data: leaderboard,
    };
  }

  async getSessionResults(sessionId: string) {
    const resultsSnapshot = await this.firebaseService.firestore
      .collection('quiz_results')
      .where('sessionId', '==', sessionId)
      .get();

    const results = resultsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    results.sort((a: any, b: any) => (b.score ?? 0) - (a.score ?? 0));

    return { data: results };
  }

  async getUserResults(userId: string) {
    const resultsSnapshot = await this.firebaseService.firestore
      .collection('quiz_results')
      .where('participantId', '==', userId)
      .get();

    const results = resultsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    results.sort((a: any, b: any) => {
      const dateA = a.submittedAt?.toDate?.() ?? new Date(a.submittedAt ?? 0);
      const dateB = b.submittedAt?.toDate?.() ?? new Date(b.submittedAt ?? 0);
      return dateB.getTime() - dateA.getTime();
    });

    return { data: results };
  }

  async getResultById(resultId: string) {
    const resultDoc = await this.firebaseService.firestore
      .collection('quiz_results')
      .doc(resultId)
      .get();

    if (!resultDoc.exists) {
      throw new NotFoundException('Result not found');
    }

    return {
      id: resultDoc.id,
      ...resultDoc.data(),
    };
  }
}
