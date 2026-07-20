import { Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, SetRoleDto } from './dto/register.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(registerDto: RegisterDto, res: Response): Promise<{
        accessToken: string;
        user: {
            id: string;
            name: string;
            role: import("./dto/register.dto").UserRole;
            displayId: string;
        };
    }>;
    login(loginDto: LoginDto, res: Response): Promise<{
        accessToken: string;
        user: {
            id: string;
            name: any;
            role: any;
            displayId: any;
        };
    }>;
    checkAdminEmail(dto: {
        email: string;
    }): Promise<{
        isValid: boolean;
    }>;
    adminLogin(dto: {
        email: string;
        pin: string;
    }, res: Response): Promise<{
        accessToken: string;
        user: {
            id: string;
            name: string;
            role: string;
            displayId: any;
        };
    }>;
    getProfile(req: any): Promise<{
        id: string;
        fullName: any;
        email: any;
        role: any;
        displayId: any;
        provider: any;
    }>;
    googleLogin(dto: {
        idToken: string;
    }, res: Response): Promise<{
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
    setRole(req: any, dto: SetRoleDto): Promise<{
        success: boolean;
        displayId: string;
    }>;
    logout(res: Response): Promise<{
        message: string;
    }>;
}
