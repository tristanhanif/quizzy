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
import * as jwt from 'jsonwebtoken';
import { SessionsService } from '../../sessions/sessions.service';
import { ResultsService } from '../../results/results.service';
import { UsersService } from '../../users/users.service';

@WebSocketGateway({
  namespace: '/participant',
  cors: {
    origin: '*',
  },
})
export class ParticipantGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ParticipantGateway.name);
  private participantRooms: Map<string, string> = new Map();

  constructor(
    private readonly sessionsService: SessionsService,
    private readonly resultsService: ResultsService,
    private readonly usersService: UsersService,
  ) {}

  afterInit(server: Server) {
    this.logger.log('Participant Gateway initialized');
  }

  handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth?.token;
      if (token) {
        const payload = jwt.verify(
          token,
          process.env.JWT_SECRET || 'quizzy-secret-key',
        ) as any;
        client.data.userId = payload.sub;
        this.logger.log(
          `Participant connected: ${client.id} (user: ${client.data.userId})`,
        );
      } else {
        this.logger.warn(`Participant connected without token: ${client.id}`);
      }
    } catch (err) {
      this.logger.error(`Participant auth failed: ${err.message}`);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Participant disconnected: ${client.id}`);
    this.participantRooms.delete(client.id);
  }

  @SubscribeMessage('join_room')
  async handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomCode: string; userId: string },
  ) {
    try {
      const { roomCode, userId } = data;

      const session = await this.sessionsService.findByRoomCode(roomCode);

      if (!session.participants.includes(userId)) {
        return { error: 'You are not a participant in this session' };
      }

      client.join(roomCode);
      this.participantRooms.set(client.id, roomCode);

      let participantName = 'Peserta';
      try {
        const userDoc = await this.usersService['usersRef'].doc(userId).get();
        if (userDoc.exists) {
          participantName = userDoc.data()?.fullName || 'Peserta';
        }
      } catch {}

      const participantData = {
        participantId: userId,
        participantName,
        participantCount: session.participants.length,
      };

      this.server.to(roomCode).emit('participant_joined', participantData);
      (this.server as any).server.of('/host').to(roomCode).emit('participant_joined', participantData);

      return { success: true, message: 'Joined room' };
    } catch (error) {
      return { error: error.message };
    }
  }

  @SubscribeMessage('submit_answer')
  async handleSubmitAnswer(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: {
      roomCode: string;
      userId: string;
      questionId: string;
      answer: string;
    },
  ) {
    try {
      const { roomCode, userId, questionId, answer } = data;

      const session = await this.sessionsService.findByRoomCode(roomCode);

      const participantDoc = await this.sessionsService.getParticipants(
        session.id,
      );

      const participant = (participantDoc.data as any[]).find(
        (p) => p.userId === userId,
      );

      if (!participant) {
        return { error: 'Participant not found' };
      }

      const quizDoc = await this.sessionsService.findOne(session.id);

      let participantName = 'Peserta';
      try {
        const userDoc = await this.usersService['usersRef'].doc(userId).get();
        if (userDoc.exists) {
          participantName = userDoc.data()?.fullName || 'Peserta';
        }
      } catch {}

      const answerSubmittedData = {
        userId,
        participantName,
        questionId,
        timestamp: new Date(),
      };
      this.server.to(roomCode).emit('answer_submitted', answerSubmittedData);
      (this.server as any).server.of('/host').to(roomCode).emit('answer_submitted', answerSubmittedData);

      return { success: true, message: 'Answer submitted' };
    } catch (error) {
      return { error: error.message };
    }
  }

  @SubscribeMessage('reconnect')
  async handleReconnect(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomCode: string; userId: string },
  ) {
    try {
      const { roomCode, userId } = data;

      const session = await this.sessionsService.findByRoomCode(roomCode);

      if (!session.participants.includes(userId)) {
        return { error: 'You are not a participant in this session' };
      }

      client.join(roomCode);
      this.participantRooms.set(client.id, roomCode);

      return {
        success: true,
        message: 'Reconnected',
        session: {
          id: session.id,
          status: session.status,
          currentQuestionIndex: session.currentQuestionIndex,
        },
      };
    } catch (error) {
      return { error: error.message };
    }
  }
}