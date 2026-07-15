import { Firestore, DocumentData, Query } from 'firebase-admin/firestore';
import { FirebaseService } from './firebase.service';

export type QueryConstraint = [string, FirebaseFirestore.WhereFilterOp, unknown];

export class FirebaseRepository<T extends DocumentData> {
  protected collection: ReturnType<Firestore['collection']>;

  constructor(
    protected readonly firebaseService: FirebaseService,
    collectionName: string,
  ) {
    this.collection = firebaseService.firestore.collection(collectionName);
  }

  async create(data: T): Promise<string> {
    const docRef = await this.collection.add({
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return docRef.id;
  }

  async findById(id: string): Promise<(T & { id: string }) | null> {
    const doc = await this.collection.doc(id).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() } as T & { id: string };
  }

  async findAll(): Promise<(T & { id: string })[]> {
    const snapshot = await this.collection.get();
    return snapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() } as T & { id: string }),
    );
  }

  async update(id: string, data: Partial<T>): Promise<void> {
    await this.collection.doc(id).update({
      ...data,
      updatedAt: new Date(),
    });
  }

  async delete(id: string): Promise<void> {
    await this.collection.doc(id).delete();
  }

  async findByField(
    field: string,
    operator: string,
    value: unknown,
  ): Promise<(T & { id: string })[]> {
    const snapshot = await this.collection.where(field, operator as any, value).get();
    return snapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() } as T & { id: string }),
    );
  }

  async count(): Promise<number> {
    const snapshot = await this.collection.count().get();
    return snapshot.data().count;
  }

  async runTransaction<R>(
    fn: (transaction: FirebaseFirestore.Transaction) => Promise<R>,
  ): Promise<R> {
    return this.firebaseService.firestore.runTransaction(fn);
  }
}
