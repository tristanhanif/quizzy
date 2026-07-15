import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';

@Injectable()
export class CategoriesService {
  constructor(private readonly firebaseService: FirebaseService) {}

  async create(createCategoryDto: CreateCategoryDto, userId: string) {
    const { name } = createCategoryDto;

    const existing = await this.firebaseService.firestore
      .collection('categories')
      .where('name', '==', name)
      .get();

    if (!existing.empty) {
      throw new ConflictException('Category with this name already exists');
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

  async findOne(id: string) {
    const doc = await this.firebaseService.firestore
      .collection('categories')
      .doc(id)
      .get();

    if (!doc.exists) {
      throw new NotFoundException('Category not found');
    }

    const data = doc.data();
    return {
      id: doc.id,
      ...data,
    };
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto, userId: string, userRole: string) {
    const doc = await this.firebaseService.firestore
      .collection('categories')
      .doc(id)
      .get();

    if (!doc.exists) {
      throw new NotFoundException('Category not found');
    }

    const categoryData = doc.data();

    if (categoryData.createdBy !== userId && userRole !== 'ADMIN') {
      throw new ForbiddenException('You can only update your own categories or be an admin');
    }

    const updateData: any = {
      updatedAt: new Date(),
    };

    if (updateCategoryDto.name) updateData.name = updateCategoryDto.name;
    if (updateCategoryDto.description !== undefined) updateData.description = updateCategoryDto.description;
    if (updateCategoryDto.icon !== undefined) updateData.icon = updateCategoryDto.icon;

    await this.firebaseService.firestore
      .collection('categories')
      .doc(id)
      .update(updateData);

    return {
      id,
      message: 'Category updated successfully',
    };
  }

  async remove(id: string, userId: string, userRole: string) {
    const doc = await this.firebaseService.firestore
      .collection('categories')
      .doc(id)
      .get();

    if (!doc.exists) {
      throw new NotFoundException('Category not found');
    }

    const categoryData = doc.data();

    if (categoryData.createdBy !== userId && userRole !== 'ADMIN') {
      throw new ForbiddenException('You can only delete your own categories or be an admin');
    }

    await this.firebaseService.firestore
      .collection('categories')
      .doc(id)
      .delete();

    return {
      message: 'Category deleted successfully',
    };
  }
}
