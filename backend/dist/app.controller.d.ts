import { FirebaseService } from './firebase/firebase.service';
export declare class AppController {
    private readonly firebaseService;
    constructor(firebaseService: FirebaseService);
    testConnection(): Promise<{
        message: string;
        error?: undefined;
    } | {
        message: string;
        error: any;
    }>;
}
