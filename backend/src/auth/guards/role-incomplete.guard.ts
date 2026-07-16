import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { FirebaseService } from '../../firebase/firebase.service';

@Injectable()
export class RoleIncompleteGuard implements CanActivate {
  constructor(
    private readonly firebaseService: FirebaseService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const skipRoleCheck = this.reflector.get<boolean>(
      'skipRoleCheck',
      context.getHandler(),
    );
    if (skipRoleCheck) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.userId) {
      return true;
    }

    const userDoc = await this.firebaseService.firestore
      .collection('users')
      .doc(user.userId)
      .get();

    if (!userDoc.exists) {
      throw new ForbiddenException('User not found');
    }

    const userData = userDoc.data();

    if (userData.role === null) {
      const allowedPaths = ['/auth/set-role'];
      const path = request.path;

      if (!allowedPaths.some((p) => path.endsWith(p))) {
        throw new ForbiddenException(
          'Role not set. Please complete onboarding at /auth/set-role.',
        );
      }
    }

    return true;
  }
}
