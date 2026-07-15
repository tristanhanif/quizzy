export declare enum UserRole {
    ADMIN = "ADMIN",
    CREATOR = "CREATOR",
    PARTICIPANT = "PARTICIPANT"
}
export declare class RegisterDto {
    fullName: string;
    email: string;
    password: string;
    role: UserRole;
}
export declare class LoginDto {
    email?: string;
    fullName?: string;
    password: string;
}
