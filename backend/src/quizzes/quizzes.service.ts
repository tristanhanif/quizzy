import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';
import { CreateQuizDto, UpdateQuizDto } from './dto/create-quiz.dto';

@Injectable()
export class QuizzesService {
  constructor(private readonly firebaseService: FirebaseService) {}

  async create(createQuizDto: CreateQuizDto, creatorId: string) {
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

  async findOne(id: string) {
    const quizDoc = await this.firebaseService.firestore
      .collection('quizzes')
      .doc(id)
      .get();

    if (!quizDoc.exists) {
      throw new NotFoundException('Quiz not found');
    }

    const data = quizDoc.data();
    return {
      id: quizDoc.id,
      ...data,
    } as any;
  }

  async update(id: string, updateQuizDto: UpdateQuizDto, userId: string) {
    const quizDoc = await this.firebaseService.firestore
      .collection('quizzes')
      .doc(id)
      .get();

    if (!quizDoc.exists) {
      throw new NotFoundException('Quiz not found');
    }

    const quizData = quizDoc.data();

    if (quizData.creatorId !== userId) {
      throw new ForbiddenException('You can only update your own quizzes');
    }

    const updateData: any = {
      updatedAt: new Date(),
    };

    if (updateQuizDto.title) updateData.title = updateQuizDto.title;
    if (updateQuizDto.description)
      updateData.description = updateQuizDto.description;
    if (updateQuizDto.isPublic !== undefined) updateData.isPublic = updateQuizDto.isPublic;
    if (updateQuizDto.questions) updateData.questions = updateQuizDto.questions;

    await this.firebaseService.firestore.collection('quizzes').doc(id).update(updateData);

    return {
      id,
      message: 'Quiz updated successfully',
    };
  }

  async remove(id: string, userId: string) {
    const quizDoc = await this.firebaseService.firestore
      .collection('quizzes')
      .doc(id)
      .get();

    if (!quizDoc.exists) {
      throw new NotFoundException('Quiz not found');
    }

    const quizData = quizDoc.data();

    if (quizData.creatorId !== userId) {
      throw new ForbiddenException('You can only delete your own quizzes');
    }

    await this.firebaseService.firestore.collection('quizzes').doc(id).delete();

    return {
      message: 'Quiz deleted successfully',
    };
  }

  async findByCreator(creatorId: string) {
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
}
