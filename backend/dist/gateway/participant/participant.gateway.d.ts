import { OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { SessionsService } from '../../sessions/sessions.service';
import { ResultsService } from '../../results/results.service';
export declare class ParticipantGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    private readonly sessionsService;
    private readonly resultsService;
    server: Server;
    private readonly logger;
    private participantRooms;
    constructor(sessionsService: SessionsService, resultsService: ResultsService);
    afterInit(server: Server): void;
    handleConnection(client: Socket): void;
    handleDisconnect(client: Socket): void;
    handleJoinRoom(client: Socket, data: {
        roomCode: string;
        userId: string;
    }): Promise<{
        success: boolean;
        message: string;
        error?: undefined;
    } | {
        error: any;
        success?: undefined;
        message?: undefined;
    }>;
    handleSubmitAnswer(client: Socket, data: {
        roomCode: string;
        userId: string;
        questionId: string;
        answer: string;
    }): Promise<{
        success: boolean;
        message: string;
        error?: undefined;
    } | {
        error: any;
        success?: undefined;
        message?: undefined;
    }>;
    handleReconnect(client: Socket, data: {
        roomCode: string;
        userId: string;
    }): Promise<{
        success: boolean;
        message: string;
        session: {
            id: any;
            status: any;
            currentQuestionIndex: any;
        };
        error?: undefined;
    } | {
        error: any;
        success?: undefined;
        message?: undefined;
        session?: undefined;
    }>;
}
