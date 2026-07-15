import { CategoriesService } from './categories.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';
export declare class CategoriesController {
    private readonly categoriesService;
    constructor(categoriesService: CategoriesService);
    create(createCategoryDto: CreateCategoryDto, req: any): Promise<{
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
    update(id: string, updateCategoryDto: UpdateCategoryDto, req: any): Promise<{
        id: string;
        message: string;
    }>;
    remove(id: string, req: any): Promise<{
        message: string;
    }>;
}
