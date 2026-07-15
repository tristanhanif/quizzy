"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FirebaseRepository = void 0;
class FirebaseRepository {
    constructor(firebaseService, collectionName) {
        this.firebaseService = firebaseService;
        this.collection = firebaseService.firestore.collection(collectionName);
    }
    async create(data) {
        const docRef = await this.collection.add({
            ...data,
            createdAt: new Date(),
            updatedAt: new Date(),
        });
        return docRef.id;
    }
    async findById(id) {
        const doc = await this.collection.doc(id).get();
        if (!doc.exists)
            return null;
        return { id: doc.id, ...doc.data() };
    }
    async findAll() {
        const snapshot = await this.collection.get();
        return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    }
    async update(id, data) {
        await this.collection.doc(id).update({
            ...data,
            updatedAt: new Date(),
        });
    }
    async delete(id) {
        await this.collection.doc(id).delete();
    }
    async findByField(field, operator, value) {
        const snapshot = await this.collection.where(field, operator, value).get();
        return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    }
    async count() {
        const snapshot = await this.collection.count().get();
        return snapshot.data().count;
    }
    async runTransaction(fn) {
        return this.firebaseService.firestore.runTransaction(fn);
    }
}
exports.FirebaseRepository = FirebaseRepository;
//# sourceMappingURL=firebase.repository.js.map