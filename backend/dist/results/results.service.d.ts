import { FirebaseService } from '../firebase/firebase.service';
import { SubmitResultDto, LeaderboardEntry } from './dto/submit-result.dto';
export declare class ResultsService {
    private readonly firebaseService;
    constructor(firebaseService: FirebaseService);
    submitResult(submitResultDto: SubmitResultDto, participantId: string): Promise<{
        id: string;
        message: string;
    }>;
    getLeaderboard(sessionId: string, limit?: number): Promise<{
        data: LeaderboardEntry[];
    }>;
    getSessionResults(sessionId: string): Promise<{
        data: {
            id: string;
        }[];
    }>;
    getUserResults(userId: string): Promise<{
        data: {
            id: string;
        }[];
    }>;
    getResultById(resultId: string): Promise<{
        id: string;
    }>;
}
