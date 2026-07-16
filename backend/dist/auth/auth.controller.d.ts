import { Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, GoogleLoginDto, SetRoleDto } from './dto/register.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(registerDto: RegisterDto, res: Response): Promise<{
        accessToken: string;
        user: {
            id: string;
            name: string;
            role: import("./dto/register.dto").UserRole;
        };
    }>;
    login(loginDto: LoginDto, res: Response): Promise<{
        accessToken: string;
        user: {
            id: string;
            name: any;
            role: any;
        };
    }>;
    getProfile(req: any): Promise<{
        id: string;
        fullName: any;
        email: any;
        role: any;
        provider: any;
    }>;
    googleLogin(dto: GoogleLoginDto, res: Response): Promise<{
        accessToken: string;
        user: {
            id: string;
            name: any;
            role: any;
            picture: any;
        };
        needsRoleSelection: boolean;
    }>;
    logout(res: Response): Promise<{
        message: string;
    }>;
    setRole(req: any, dto: SetRoleDto): Promise<{
        success: boolean;
    }>;
}
