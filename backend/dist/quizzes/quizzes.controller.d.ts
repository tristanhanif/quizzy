import { QuizzesService } from './quizzes.service';
import { CreateQuizDto, UpdateQuizDto } from './dto/create-quiz.dto';
export declare class QuizzesController {
    private readonly quizzesService;
    constructor(quizzesService: QuizzesService);
    create(createQuizDto: CreateQuizDto, req: any): Promise<{
        id: string;
        message: string;
    }>;
    findAll(): Promise<{
        data: {
            id: string;
        }[];
    }>;
    findOne(id: string): Promise<any>;
    update(id: string, updateQuizDto: UpdateQuizDto, req: any): Promise<{
        id: string;
        message: string;
    }>;
    remove(id: string, req: any): Promise<{
        message: string;
    }>;
    findByCreator(creatorId: string): Promise<{
        data: {
            id: string;
        }[];
    }>;
}
