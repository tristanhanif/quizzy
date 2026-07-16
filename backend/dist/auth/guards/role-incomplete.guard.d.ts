import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { FirebaseService } from '../../firebase/firebase.service';
export declare class RoleIncompleteGuard implements CanActivate {
    private readonly firebaseService;
    private readonly reflector;
    constructor(firebaseService: FirebaseService, reflector: Reflector);
    canActivate(context: ExecutionContext): Promise<boolean>;
}
