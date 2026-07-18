import { JwtService } from '@nestjs/jwt';
import { FirebaseService } from '../firebase/firebase.service';
import { RegisterDto, LoginDto, SetRoleDto } from './dto/register.dto';
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
            displayId: string;
        };
    }>;
    login(loginDto: LoginDto): Promise<{
        accessToken: string;
        user: {
            id: string;
            name: any;
            role: any;
            displayId: any;
        };
    }>;
    getProfile(userId: string): Promise<{
        id: string;
        fullName: any;
        email: any;
        role: any;
        displayId: any;
        provider: any;
    }>;
    googleLogin(dto: {
        idToken: string;
    }): Promise<{
        accessToken: string;
        user: {
            id: string;
            name: any;
            role: any;
            displayId: any;
            picture: any;
        };
        needsRoleSelection: boolean;
    }>;
    setRole(userId: string, dto: SetRoleDto): Promise<{
        success: boolean;
        displayId: string;
    }>;
    generateToken(payload: {
        sub: string;
        email: string;
        role: string;
    }): string;
}
