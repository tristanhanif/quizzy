"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoleIncompleteGuard = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const firebase_service_1 = require("../../firebase/firebase.service");
let RoleIncompleteGuard = class RoleIncompleteGuard {
    constructor(firebaseService, reflector) {
        this.firebaseService = firebaseService;
        this.reflector = reflector;
    }
    async canActivate(context) {
        const skipRoleCheck = this.reflector.get('skipRoleCheck', context.getHandler());
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
            throw new common_1.ForbiddenException('User not found');
        }
        const userData = userDoc.data();
        if (userData.role === null) {
            const allowedPaths = ['/auth/set-role'];
            const path = request.path;
            if (!allowedPaths.some((p) => path.endsWith(p))) {
                throw new common_1.ForbiddenException('Role not set. Please complete onboarding at /auth/set-role.');
            }
        }
        return true;
    }
};
exports.RoleIncompleteGuard = RoleIncompleteGuard;
exports.RoleIncompleteGuard = RoleIncompleteGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [firebase_service_1.FirebaseService,
        core_1.Reflector])
], RoleIncompleteGuard);
//# sourceMappingURL=role-incomplete.guard.js.map