import { UsersService } from './users.service';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
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
    sendMutualRequest(req: any, body: {
        targetDisplayId: string;
    }): Promise<{
        id: string;
        message: string;
    }>;
    acceptMutualRequest(req: any, body: {
        mutualId: string;
    }): Promise<{
        message: string;
    }>;
    declineMutualRequest(req: any, body: {
        mutualId: string;
    }): Promise<{
        message: string;
    }>;
    removeMutual(req: any, mutualId: string): Promise<{
        message: string;
    }>;
    getMutualStatus(req: any, targetUserId: string): Promise<{
        status: string;
        mutualId: any;
        requestedBy?: undefined;
    } | {
        status: any;
        mutualId: string;
        requestedBy: any;
    }>;
    getMyMutuals(req: any): Promise<{
        data: {
            id: string;
            name: any;
            displayId: any;
            role: any;
            picture: any;
        }[];
    }>;
    getPendingMutuals(req: any): Promise<{
        data: {
            id: string;
        }[];
    }>;
    getMutualCount(userId: string): Promise<{
        count: number;
    }>;
    updateProfile(req: any, body: {
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
