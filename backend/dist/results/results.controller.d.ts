import { ResultsService } from './results.service';
import { SubmitResultDto } from './dto/submit-result.dto';
export declare class ResultsController {
    private readonly resultsService;
    constructor(resultsService: ResultsService);
    submitResult(submitResultDto: SubmitResultDto, req: any): Promise<{
        id: string;
        message: string;
    }>;
    getLeaderboard(sessionId: string, limit?: string): Promise<{
        data: import("./dto/submit-result.dto").LeaderboardEntry[];
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
    getResultById(id: string): Promise<{
        id: string;
    }>;
}
