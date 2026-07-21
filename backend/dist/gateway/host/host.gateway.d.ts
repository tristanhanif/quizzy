import { OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { SessionsService } from '../../sessions/sessions.service';
import { QuizzesService } from '../../quizzes/quizzes.service';
import { ResultsService } from '../../results/results.service';
import { UsersService } from '../../users/users.service';
export declare class HostGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    private readonly sessionsService;
    private readonly quizzesService;
    private readonly resultsService;
    private readonly usersService;
    server: Server;
    private readonly logger;
    private hostRooms;
    constructor(sessionsService: SessionsService, quizzesService: QuizzesService, resultsService: ResultsService, usersService: UsersService);
    afterInit(server: Server): void;
    handleConnection(client: Socket): void;
    handleDisconnect(client: Socket): void;
    handleJoinRoom(client: Socket, data: {
        roomCode: string;
        userId: string;
    }): Promise<{
        success: boolean;
        message: string;
        participants: {
            id: string;
            name: any;
        }[];
        participantCount: number;
        error?: undefined;
    } | {
        error: any;
        success?: undefined;
        message?: undefined;
        participants?: undefined;
        participantCount?: undefined;
    }>;
    handleStartQuiz(client: Socket, data: {
        roomCode: string;
    }): Promise<{
        success: boolean;
        message: string;
        error?: undefined;
    } | {
        error: any;
        success?: undefined;
        message?: undefined;
    }>;
    handleNextQuestion(client: Socket, data: {
        roomCode: string;
    }): Promise<{
        success: boolean;
        message: string;
        error?: undefined;
    } | {
        error: any;
        success?: undefined;
        message?: undefined;
    }>;
    handleEndQuiz(client: Socket, data: {
        roomCode: string;
    }): Promise<{
        success: boolean;
        message: string;
        error?: undefined;
    } | {
        error: any;
        success?: undefined;
        message?: undefined;
    }>;
}
