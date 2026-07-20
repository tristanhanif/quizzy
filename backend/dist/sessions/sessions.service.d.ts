import { FirebaseService } from '../firebase/firebase.service';
import { CreateSessionDto, JoinSessionDto, SessionStatus } from './dto/create-session.dto';
export declare class SessionsService {
    private readonly firebaseService;
    constructor(firebaseService: FirebaseService);
    private generateRoomCode;
    create(createSessionDto: CreateSessionDto, creatorId: string): Promise<{
        sessionId: string;
        roomCode: string;
    }>;
    join(joinSessionDto: JoinSessionDto, userId: string): Promise<{
        isValid: boolean;
        sessionId: string;
        websocketUrl: string;
    }>;
    findOne(id: string): Promise<any>;
    findByRoomCode(roomCode: string): Promise<any>;
    getParticipants(sessionId: string): Promise<{
        data: {
            id: string;
        }[];
    }>;
    updateStatus(sessionId: string, status: SessionStatus): Promise<{
        message: string;
    }>;
    updateCurrentQuestion(sessionId: string, questionIndex: number): Promise<{
        message: string;
        endTime: string;
    }>;
    findByCreatorId(creatorId: string): Promise<{
        data: {
            quizTitle: string;
            participantCount: any;
            id: string;
        }[];
    }>;
    setEndTime(sessionId: string, endTime: Date): Promise<{
        message: string;
        endTime: string;
    }>;
}
