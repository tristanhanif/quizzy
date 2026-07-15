"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GatewayModule = void 0;
const common_1 = require("@nestjs/common");
const host_gateway_1 = require("./host/host.gateway");
const participant_gateway_1 = require("./participant/participant.gateway");
const sessions_module_1 = require("../sessions/sessions.module");
const quizzes_module_1 = require("../quizzes/quizzes.module");
const results_module_1 = require("../results/results.module");
let GatewayModule = class GatewayModule {
};
exports.GatewayModule = GatewayModule;
exports.GatewayModule = GatewayModule = __decorate([
    (0, common_1.Module)({
        imports: [sessions_module_1.SessionsModule, quizzes_module_1.QuizzesModule, results_module_1.ResultsModule],
        providers: [host_gateway_1.HostGateway, participant_gateway_1.ParticipantGateway],
        exports: [host_gateway_1.HostGateway, participant_gateway_1.ParticipantGateway],
    })
], GatewayModule);
//# sourceMappingURL=gateway.module.js.map