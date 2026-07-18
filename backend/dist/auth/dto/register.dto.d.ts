export declare enum UserRole {
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
    email: string;
    password: string;
}
export declare class SetRoleDto {
    role: UserRole;
}
