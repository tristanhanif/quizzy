import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FirebaseModule } from './firebase/firebase.module';
import { AuthModule } from './auth/auth.module';
import { QuizzesModule } from './quizzes/quizzes.module';
import { SessionsModule } from './sessions/sessions.module';
import { ResultsModule } from './results/results.module';
import { GatewayModule } from './gateway/gateway.module';
import { CategoriesModule } from './categories/categories.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    FirebaseModule,
    AuthModule,
    QuizzesModule,
    SessionsModule,
    ResultsModule,
    GatewayModule,
    CategoriesModule,
    UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
