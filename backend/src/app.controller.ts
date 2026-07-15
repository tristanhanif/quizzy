import { Controller, Get } from '@nestjs/common';
import { FirebaseService } from './firebase/firebase.service';

@Controller('test-db')
export class AppController {
  constructor(private readonly firebaseService: FirebaseService) {}

  @Get()
  async testConnection() {
    try {
      await this.firebaseService.firestore
        .collection('test')
        .doc('connection')
        .set({ status: 'Connected Successfully!' });
      return { message: 'Database Quizzy tersambung dengan sukses!' };
    } catch (error) {
      return { message: 'Gagal tersambung', error: error.message };
    }
  }
}
