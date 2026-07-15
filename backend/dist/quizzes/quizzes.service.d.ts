import { FirebaseService } from '../firebase/firebase.service';
import { CreateQuizDto, UpdateQuizDto } from './dto/create-quiz.dto';
export declare class QuizzesService {
    private readonly firebaseService;
    constructor(firebaseService: FirebaseService);
    create(createQuizDto: CreateQuizDto, creatorId: string): Promise<{
        id: string;
        message: string;
    }>;
    findAll(): Promise<{
        data: {
            id: string;
        }[];
    }>;
    findOne(id: string): Promise<any>;
    update(id: string, updateQuizDto: UpdateQuizDto, userId: string): Promise<{
        id: string;
        message: string;
    }>;
    remove(id: string, userId: string): Promise<{
        message: string;
    }>;
    findByCreator(creatorId: string): Promise<{
        data: {
            id: string;
        }[];
    }>;
}
