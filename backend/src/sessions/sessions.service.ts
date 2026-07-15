import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';
import { CreateSessionDto, JoinSessionDto, SessionStatus } from './dto/create-session.dto';

@Injectable()
export class SessionsService {
  constructor(private readonly firebaseService: FirebaseService) {}

  private generateRoomCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  async create(createSessionDto: CreateSessionDto, creatorId: string) {
    const { quizId, maxParticipants, questionTimeLimit, endTime } = createSessionDto;

    const quizDoc = await this.firebaseService.firestore
      .collection('quizzes')
      .doc(quizId)
      .get();

    if (!quizDoc.exists) {
      throw new NotFoundException('Quiz not found');
    }

    const quizData = quizDoc.data();

    if (quizData.creatorId !== creatorId) {
      throw new ForbiddenException('You can only create sessions for your own quizzes');
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
      } else {
        roomCode = this.generateRoomCode();
      }
    }

    const sessionData: any = {
      quizId,
      creatorId,
      roomCode,
      status: SessionStatus.WAITING,
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

  async join(joinSessionDto: JoinSessionDto, userId: string) {
    const { roomCode } = joinSessionDto;

    const sessionsRef = this.firebaseService.firestore.collection('quiz_sessions');
    const snapshot = await sessionsRef.where('roomCode', '==', roomCode).get();

    if (snapshot.empty) {
      throw new NotFoundException('Session not found');
    }

    const sessionDoc = snapshot.docs[0];
    const sessionData = sessionDoc.data();

    if (sessionData.status === SessionStatus.FINISHED) {
      throw new BadRequestException('Session has already ended');
    }

    if (sessionData.participants.includes(userId)) {
      throw new BadRequestException('You are already in this session');
    }

    if (sessionData.participants.length >= sessionData.maxParticipants) {
      throw new BadRequestException('Session is full');
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

  async findOne(id: string) {
    const sessionDoc = await this.firebaseService.firestore
      .collection('quiz_sessions')
      .doc(id)
      .get();

    if (!sessionDoc.exists) {
      throw new NotFoundException('Session not found');
    }

    const data = sessionDoc.data();
    return {
      id: sessionDoc.id,
      ...data,
    } as any;
  }

  async findByRoomCode(roomCode: string) {
    const snapshot = await this.firebaseService.firestore
      .collection('quiz_sessions')
      .where('roomCode', '==', roomCode)
      .get();

    if (snapshot.empty) {
      throw new NotFoundException('Session not found');
    }

    const sessionDoc = snapshot.docs[0];
    const data = sessionDoc.data();
    return {
      id: sessionDoc.id,
      ...data,
    } as any;
  }

  async getParticipants(sessionId: string) {
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

  async updateStatus(sessionId: string, status: SessionStatus) {
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

  async updateCurrentQuestion(sessionId: string, questionIndex: number) {
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

  async setEndTime(sessionId: string, endTime: Date) {
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
}
