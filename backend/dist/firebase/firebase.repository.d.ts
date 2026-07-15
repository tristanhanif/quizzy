import { Firestore, DocumentData } from 'firebase-admin/firestore';
import { FirebaseService } from './firebase.service';
export type QueryConstraint = [string, FirebaseFirestore.WhereFilterOp, unknown];
export declare class FirebaseRepository<T extends DocumentData> {
    protected readonly firebaseService: FirebaseService;
    protected collection: ReturnType<Firestore['collection']>;
    constructor(firebaseService: FirebaseService, collectionName: string);
    create(data: T): Promise<string>;
    findById(id: string): Promise<(T & {
        id: string;
    }) | null>;
    findAll(): Promise<(T & {
        id: string;
    })[]>;
    update(id: string, data: Partial<T>): Promise<void>;
    delete(id: string): Promise<void>;
    findByField(field: string, operator: string, value: unknown): Promise<(T & {
        id: string;
    })[]>;
    count(): Promise<number>;
    runTransaction<R>(fn: (transaction: FirebaseFirestore.Transaction) => Promise<R>): Promise<R>;
}
