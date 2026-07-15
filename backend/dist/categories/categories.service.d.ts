import { FirebaseService } from '../firebase/firebase.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';
export declare class CategoriesService {
    private readonly firebaseService;
    constructor(firebaseService: FirebaseService);
    create(createCategoryDto: CreateCategoryDto, userId: string): Promise<{
        id: string;
        message: string;
    }>;
    findAll(): Promise<{
        data: {
            id: string;
        }[];
    }>;
    findOne(id: string): Promise<{
        id: string;
    }>;
    update(id: string, updateCategoryDto: UpdateCategoryDto, userId: string, userRole: string): Promise<{
        id: string;
        message: string;
    }>;
    remove(id: string, userId: string, userRole: string): Promise<{
        message: string;
    }>;
}
