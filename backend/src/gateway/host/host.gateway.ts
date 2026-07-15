import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { SessionsService } from '../../sessions/sessions.service';
import { QuizzesService } from '../../quizzes/quizzes.service';
import { ResultsService } from '../../results/results.service';
import { SessionStatus } from '../../sessions/dto/create-session.dto';

@WebSocketGateway({
  namespace: '/host',
  cors: {
    origin: '*',
  },
})
export class HostGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(HostGateway.name);
  private hostRooms: Map<string, string> = new Map();

  constructor(
    private readonly sessionsService: SessionsService,
    private readonly quizzesService: QuizzesService,
    private readonly resultsService: ResultsService,
  ) {}

  afterInit(server: Server) {
    this.logger.log('Host Gateway initialized');
  }

  handleConnection(client: Socket) {
    this.logger.log(`Host connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Host disconnected: ${client.id}`);
    this.hostRooms.delete(client.id);
  }

  @SubscribeMessage('start_quiz')
  async handleStartQuiz(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomCode: string },
  ) {
    try {
      const { roomCode } = data;

      const session = await this.sessionsService.findByRoomCode(roomCode);

      if (session.creatorId !== client.data.userId) {
        return { error: 'Only the session creator can start the quiz' };
      }

      await this.sessionsService.updateStatus(session.id, SessionStatus.LIVE);
      await this.sessionsService.updateCurrentQuestion(session.id, 0);

      this.hostRooms.set(client.id, roomCode);

      const quiz = await this.quizzesService.findOne(session.quizId);
      const firstQuestion = quiz.questions[0];

      this.server.to(roomCode).emit('quiz_started', {
        roomCode,
        question: firstQuestion,
        questionIndex: 0,
        totalQuestions: quiz.questions.length,
      });

      return { success: true, message: 'Quiz started' };
    } catch (error) {
      return { error: error.message };
    }
  }

  @SubscribeMessage('next_question')
  async handleNextQuestion(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomCode: string },
  ) {
    try {
      const { roomCode } = data;

      const session = await this.sessionsService.findByRoomCode(roomCode);

      if (session.creatorId !== client.data.userId) {
        return { error: 'Only the session creator can control the quiz' };
      }

      const nextIndex = session.currentQuestionIndex + 1;
      const quiz = await this.quizzesService.findOne(session.quizId);

      if (nextIndex >= quiz.questions.length) {
        await this.sessionsService.updateStatus(
          session.id,
          SessionStatus.FINISHED,
        );

        const leaderboard = await this.resultsService.getLeaderboard(
          session.id,
        );

        this.server.to(roomCode).emit('quiz_finished', {
          roomCode,
          leaderboard: leaderboard.data,
        });

        return { success: true, message: 'Quiz finished' };
      }

      await this.sessionsService.updateCurrentQuestion(session.id, nextIndex);

      const nextQuestion = quiz.questions[nextIndex];

      this.server.to(roomCode).emit('new_question', {
        roomCode,
        question: nextQuestion,
        questionIndex: nextIndex,
        totalQuestions: quiz.questions.length,
      });

      return { success: true, message: 'Next question sent' };
    } catch (error) {
      return { error: error.message };
    }
  }

  @SubscribeMessage('end_quiz')
  async handleEndQuiz(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomCode: string },
  ) {
    try {
      const { roomCode } = data;

      const session = await this.sessionsService.findByRoomCode(roomCode);

      if (session.creatorId !== client.data.userId) {
        return { error: 'Only the session creator can end the quiz' };
      }

      await this.sessionsService.updateStatus(
        session.id,
        SessionStatus.FINISHED,
      );

      const leaderboard = await this.resultsService.getLeaderboard(session.id);

      this.server.to(roomCode).emit('quiz_finished', {
        roomCode,
        leaderboard: leaderboard.data,
      });

      this.hostRooms.delete(client.id);

      return { success: true, message: 'Quiz ended' };
    } catch (error) {
      return { error: error.message };
    }
  }
}
