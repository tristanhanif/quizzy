import { AuthService } from './auth.service';
import { RegisterDto, LoginDto } from './dto/register.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
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
    getProfile(req: any): Promise<{
        id: string;
        fullName: any;
        email: any;
        role: any;
    }>;
}
