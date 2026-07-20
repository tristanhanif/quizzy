import { FirebaseService } from '../firebase/firebase.service';
export declare class AdminService {
    private readonly firebaseService;
    constructor(firebaseService: FirebaseService);
    private get usersRef();
    getAllUsers(): Promise<{
        data: {
            id: string;
            name: any;
            email: any;
            role: any;
            displayId: any;
            provider: any;
            createdAt: any;
        }[];
    }>;
    getStats(): Promise<{
        totalUsers: number;
        totalCategories: number;
        totalQuizzes: number;
        totalSessions: number;
        usersByRole: {
            admin: number;
            creator: number;
            participant: number;
        };
    }>;
    updateUserRole(userId: string, role: string): Promise<{
        error: string;
        message?: undefined;
    } | {
        message: string;
        error?: undefined;
    }>;
    getAllQuizzes(): Promise<{
        data: {
            id: string;
            title: any;
            description: any;
            creatorId: any;
            creatorName: string;
            questionCount: any;
            isPublic: boolean;
            createdAt: any;
        }[];
    }>;
    forceDeleteQuiz(quizId: string): Promise<{
        message: string;
    }>;
    deleteUser(userId: string): Promise<{
        message: string;
    }>;
    getMaintenanceMode(): Promise<{
        enabled: any;
    }>;
    toggleMaintenanceMode(enabled: boolean): Promise<{
        message: string;
        enabled: boolean;
    }>;
    getActiveSessions(): Promise<{
        count: number;
    }>;
    sendBroadcast(message: string): Promise<{
        message: string;
    }>;
    getBroadcast(): Promise<{
        active: boolean;
        message: any;
    }>;
    clearBroadcast(): Promise<{
        message: string;
    }>;
}
