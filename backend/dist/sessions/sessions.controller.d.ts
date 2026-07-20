import { SessionsService } from './sessions.service';
import { CreateSessionDto, JoinSessionDto } from './dto/create-session.dto';
export declare class SessionsController {
    private readonly sessionsService;
    constructor(sessionsService: SessionsService);
    create(createSessionDto: CreateSessionDto, req: any): Promise<{
        sessionId: string;
        roomCode: string;
    }>;
    join(joinSessionDto: JoinSessionDto, req: any): Promise<{
        isValid: boolean;
        sessionId: string;
        websocketUrl: string;
    }>;
    findMine(req: any): Promise<{
        data: {
            quizTitle: string;
            participantCount: any;
            id: string;
        }[];
    }>;
    findOne(id: string): Promise<any>;
    findByRoomCode(roomCode: string): Promise<any>;
    getParticipants(id: string): Promise<{
        data: {
            id: string;
        }[];
    }>;
}
