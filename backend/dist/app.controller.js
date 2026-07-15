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
exports.AppController = void 0;
const common_1 = require("@nestjs/common");
const firebase_service_1 = require("./firebase/firebase.service");
let AppController = class AppController {
    constructor(firebaseService) {
        this.firebaseService = firebaseService;
    }
    async testConnection() {
        try {
            await this.firebaseService.firestore
                .collection('test')
                .doc('connection')
                .set({ status: 'Connected Successfully!' });
            return { message: 'Database Quizzy tersambung dengan sukses!' };
        }
        catch (error) {
            return { message: 'Gagal tersambung', error: error.message };
        }
    }
};
exports.AppController = AppController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AppController.prototype, "testConnection", null);
exports.AppController = AppController = __decorate([
    (0, common_1.Controller)('test-db'),
    __metadata("design:paramtypes", [firebase_service_1.FirebaseService])
], AppController);
//# sourceMappingURL=app.controller.js.map