"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoriesService = void 0;
const common_1 = require("@nestjs/common");
const firebase_service_1 = require("../firebase/firebase.service");
let CategoriesService = class CategoriesService {
    constructor(firebaseService) {
        this.firebaseService = firebaseService;
    }
    async create(createCategoryDto, userId) {
        const { name } = createCategoryDto;
        const existing = await this.firebaseService.firestore
            .collection('categories')
            .where('name', '==', name)
            .get();
        if (!existing.empty) {
            throw new common_1.ConflictException('Category with this name already exists');
        }
        const categoryData = {
            name,
            description: createCategoryDto.description || '',
            icon: createCategoryDto.icon || '',
            createdBy: userId,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        const docRef = await this.firebaseService.firestore
            .collection('categories')
            .add(categoryData);
        return {
            id: docRef.id,
            message: 'Category created successfully',
        };
    }
    async findAll() {
        const snapshot = await this.firebaseService.firestore
            .collection('categories')
            .orderBy('name', 'asc')
            .get();
        return {
            data: snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            })),
        };
    }
    async findOne(id) {
        const doc = await this.firebaseService.firestore
            .collection('categories')
            .doc(id)
            .get();
        if (!doc.exists) {
            throw new common_1.NotFoundException('Category not found');
        }
        const data = doc.data();
        return {
            id: doc.id,
            ...data,
        };
    }
    async update(id, updateCategoryDto, userId, userRole) {
        const doc = await this.firebaseService.firestore
            .collection('categories')
            .doc(id)
            .get();
        if (!doc.exists) {
            throw new common_1.NotFoundException('Category not found');
        }
        const categoryData = doc.data();
        if (categoryData.createdBy !== userId && userRole !== 'ADMIN') {
            throw new common_1.ForbiddenException('You can only update your own categories or be an admin');
        }
        const updateData = {
            updatedAt: new Date(),
        };
        if (updateCategoryDto.name)
            updateData.name = updateCategoryDto.name;
        if (updateCategoryDto.description !== undefined)
            updateData.description = updateCategoryDto.description;
        if (updateCategoryDto.icon !== undefined)
            updateData.icon = updateCategoryDto.icon;
        await this.firebaseService.firestore
            .collection('categories')
            .doc(id)
            .update(updateData);
        return {
            id,
            message: 'Category updated successfully',
        };
    }
    async remove(id, userId, userRole) {
        const doc = await this.firebaseService.firestore
            .collection('categories')
            .doc(id)
            .get();
        if (!doc.exists) {
            throw new common_1.NotFoundException('Category not found');
        }
        const categoryData = doc.data();
        if (categoryData.createdBy !== userId && userRole !== 'ADMIN') {
            throw new common_1.ForbiddenException('You can only delete your own categories or be an admin');
        }
        await this.firebaseService.firestore
            .collection('categories')
            .doc(id)
            .delete();
        return {
            message: 'Category deleted successfully',
        };
    }
};
exports.CategoriesService = CategoriesService;
exports.CategoriesService = CategoriesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [firebase_service_1.FirebaseService])
], CategoriesService);
//# sourceMappingURL=categories.service.js.map