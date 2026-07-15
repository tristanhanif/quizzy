import { OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { SessionsService } from '../../sessions/sessions.service';
import { QuizzesService } from '../../quizzes/quizzes.service';
import { ResultsService } from '../../results/results.service';
export declare class HostGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    private readonly sessionsService;
    private readonly quizzesService;
    private readonly resultsService;
    server: Server;
    private readonly logger;
    private hostRooms;
    constructor(sessionsService: SessionsService, quizzesService: QuizzesService, resultsService: ResultsService);
    afterInit(server: Server): void;
    handleConnection(client: Socket): void;
    handleDisconnect(client: Socket): void;
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
