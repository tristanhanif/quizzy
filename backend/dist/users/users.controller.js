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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersController = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const users_service_1 = require("./users.service");
let UsersController = class UsersController {
    constructor(usersService) {
        this.usersService = usersService;
    }
    async searchByDisplayId(displayId) {
        return this.usersService.searchByDisplayId(displayId);
    }
    async getUserProfile(displayId) {
        return this.usersService.getUserProfile(displayId);
    }
    async sendMutualRequest(req, body) {
        return this.usersService.sendMutualRequest(req.user.userId, body.targetDisplayId);
    }
    async acceptMutualRequest(req, body) {
        return this.usersService.acceptMutualRequest(req.user.userId, body.mutualId);
    }
    async declineMutualRequest(req, body) {
        return this.usersService.declineMutualRequest(req.user.userId, body.mutualId);
    }
    async removeMutual(req, mutualId) {
        return this.usersService.removeMutual(req.user.userId, mutualId);
    }
    async getMutualStatus(req, targetUserId) {
        return this.usersService.getMutualStatus(req.user.userId, targetUserId);
    }
    async getMyMutuals(req) {
        return this.usersService.getMyMutuals(req.user.userId);
    }
    async getPendingMutuals(req) {
        return this.usersService.getPendingMutuals(req.user.userId);
    }
    async getMutualCount(userId) {
        const count = await this.usersService.getMutualCount(userId);
        return { count };
    }
    async updateProfile(req, body) {
        return this.usersService.updateProfile(req.user.userId, body);
    }
};
exports.UsersController = UsersController;
__decorate([
    (0, common_1.Get)('search/:displayId'),
    __param(0, (0, common_1.Param)('displayId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "searchByDisplayId", null);
__decorate([
    (0, common_1.Get)('profile/:displayId'),
    __param(0, (0, common_1.Param)('displayId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getUserProfile", null);
__decorate([
    (0, common_1.Post)('mutual'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "sendMutualRequest", null);
__decorate([
    (0, common_1.Post)('mutual/accept'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "acceptMutualRequest", null);
__decorate([
    (0, common_1.Post)('mutual/decline'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "declineMutualRequest", null);
__decorate([
    (0, common_1.Delete)('mutual/:mutualId'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('mutualId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "removeMutual", null);
__decorate([
    (0, common_1.Get)('mutual/status/:targetUserId'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('targetUserId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getMutualStatus", null);
__decorate([
    (0, common_1.Get)('mutual/list'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getMyMutuals", null);
__decorate([
    (0, common_1.Get)('mutual/pending'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getPendingMutuals", null);
__decorate([
    (0, common_1.Get)('mutual/count/:userId'),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getMutualCount", null);
__decorate([
    (0, common_1.Patch)('profile'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "updateProfile", null);
exports.UsersController = UsersController = __decorate([
    (0, common_1.Controller)('users'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __metadata("design:paramtypes", [users_service_1.UsersService])
], UsersController);
//# sourceMappingURL=users.controller.js.map