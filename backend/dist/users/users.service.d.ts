import { FirebaseService } from '../firebase/firebase.service';
export declare class UsersService {
    private readonly firebaseService;
    constructor(firebaseService: FirebaseService);
    private get usersRef();
    private get mutualsRef();
    searchByDisplayId(displayId: string): Promise<{
        id: string;
        name: any;
        displayId: any;
        role: any;
        email: any;
        picture: any;
        provider: any;
        createdAt: any;
    }>;
    getUserProfile(displayId: string): Promise<{
        id: string;
        name: any;
        displayId: any;
        role: any;
        email: any;
        picture: any;
        provider: any;
        createdAt: any;
    }>;
    sendMutualRequest(senderId: string, targetUserId: string): Promise<{
        id: string;
        message: string;
    }>;
    acceptMutualRequest(userId: string, mutualId: string): Promise<{
        message: string;
    }>;
    declineMutualRequest(userId: string, mutualId: string): Promise<{
        message: string;
    }>;
    removeMutual(userId: string, mutualId: string): Promise<{
        message: string;
    }>;
    getMutualStatus(userId: string, targetUserId: string): Promise<{
        status: string;
        mutualId: any;
        requestedBy?: undefined;
    } | {
        status: any;
        mutualId: string;
        requestedBy: any;
    }>;
    getMyMutuals(userId: string): Promise<{
        data: {
            id: string;
            name: any;
            displayId: any;
            role: any;
            picture: any;
        }[];
    }>;
    getPendingMutuals(userId: string): Promise<{
        data: {
            id: string;
        }[];
    }>;
    getMutualCount(userId: string): Promise<number>;
    updateProfile(userId: string, dto: {
        fullName?: string;
        picture?: string;
    }): Promise<{
        id: string;
        name: any;
        displayId: any;
        role: any;
        email: any;
        picture: any;
        provider: any;
    }>;
}
