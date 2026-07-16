import { JwtService } from '@nestjs/jwt';
import { FirebaseService } from '../firebase/firebase.service';
import { RegisterDto, LoginDto, GoogleLoginDto, SetRoleDto } from './dto/register.dto';
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
            id: string;
            name: any;
            role: any;
        };
    }>;
    getProfile(userId: string): Promise<{
        id: string;
        fullName: any;
        email: any;
        role: any;
        provider: any;
    }>;
    googleLogin(dto: GoogleLoginDto): Promise<{
        accessToken: string;
        user: {
            id: string;
            name: any;
            role: any;
            picture: any;
        };
        needsRoleSelection: boolean;
    }>;
    setRole(userId: string, dto: SetRoleDto): Promise<{
        success: boolean;
    }>;
    generateToken(payload: {
        sub: string;
        email: string;
        role: string;
    }): string;
}
