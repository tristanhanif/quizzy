import { JwtService } from '@nestjs/jwt';
import { FirebaseService } from '../firebase/firebase.service';
import { RegisterDto, LoginDto } from './dto/register.dto';
export declare class AuthService {
    private readonly firebaseService;
    private readonly jwtService;
    constructor(firebaseService: FirebaseService, jwtService: JwtService);
    register(registerDto: RegisterDto): Promise<{
        accessToken: string;
        user: {
            id: string;
            name: string;
            role: import("./dto/register.dto").UserRole;
        };
    }>;
    login(loginDto: LoginDto): Promise<{
        accessToken: string;
        user: {
            id: any;
            name: any;
            role: any;
        };
    }>;
    getProfile(userId: string): Promise<{
        id: string;
        fullName: any;
        email: any;
        role: any;
    }>;
    private generateToken;
}
