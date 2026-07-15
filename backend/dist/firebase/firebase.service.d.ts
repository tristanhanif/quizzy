import { OnModuleInit } from '@nestjs/common';
import { Firestore } from 'firebase-admin/firestore';
import { Auth } from 'firebase-admin/auth';
export declare class FirebaseService implements OnModuleInit {
    private readonly logger;
    private app;
    private _firestore;
    private _auth;
    onModuleInit(): void;
    get firestore(): Firestore;
    get auth(): Auth;
}
