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
var HostGateway_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.HostGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const common_1 = require("@nestjs/common");
const jwt = require("jsonwebtoken");
const sessions_service_1 = require("../../sessions/sessions.service");
const quizzes_service_1 = require("../../quizzes/quizzes.service");
const results_service_1 = require("../../results/results.service");
const create_session_dto_1 = require("../../sessions/dto/create-session.dto");
let HostGateway = HostGateway_1 = class HostGateway {
    constructor(sessionsService, quizzesService, resultsService) {
        this.sessionsService = sessionsService;
        this.quizzesService = quizzesService;
        this.resultsService = resultsService;
        this.logger = new common_1.Logger(HostGateway_1.name);
        this.hostRooms = new Map();
    }
    afterInit(server) {
        this.logger.log('Host Gateway initialized');
    }
    handleConnection(client) {
        try {
            const token = client.handshake.auth?.token;
            if (token) {
                const payload = jwt.verify(token, process.env.JWT_SECRET || 'quizzy-secret-key');
                client.data.userId = payload.sub;
                this.logger.log(`Host connected: ${client.id} (user: ${client.data.userId})`);
            }
            else {
                this.logger.warn(`Host connected without token: ${client.id}`);
            }
        }
        catch (err) {
            this.logger.error(`Host auth failed: ${err.message}`);
            client.disconnect();
        }
    }
    handleDisconnect(client) {
        this.logger.log(`Host disconnected: ${client.id}`);
        this.hostRooms.delete(client.id);
    }
    async handleStartQuiz(client, data) {
        try {
            const { roomCode } = data;
            const session = await this.sessionsService.findByRoomCode(roomCode);
            if (session.creatorId !== client.data.userId) {
                return { error: 'Only the session creator can start the quiz' };
            }
            await this.sessionsService.updateStatus(session.id, create_session_dto_1.SessionStatus.LIVE);
            await this.sessionsService.updateCurrentQuestion(session.id, 0);
            this.hostRooms.set(client.id, roomCode);
            const quiz = await this.quizzesService.findOne(session.quizId);
            const firstQuestion = quiz.questions[0];
            this.server.to(roomCode).emit('quiz_started', {
                roomCode,
                question: firstQuestion,
                questionIndex: 0,
                totalQuestions: quiz.questions.length,
            });
            return { success: true, message: 'Quiz started' };
        }
        catch (error) {
            return { error: error.message };
        }
    }
    async handleNextQuestion(client, data) {
        try {
            const { roomCode } = data;
            const session = await this.sessionsService.findByRoomCode(roomCode);
            if (session.creatorId !== client.data.userId) {
                return { error: 'Only the session creator can control the quiz' };
            }
            const nextIndex = session.currentQuestionIndex + 1;
            const quiz = await this.quizzesService.findOne(session.quizId);
            if (nextIndex >= quiz.questions.length) {
                await this.sessionsService.updateStatus(session.id, create_session_dto_1.SessionStatus.FINISHED);
                const leaderboard = await this.resultsService.getLeaderboard(session.id);
                this.server.to(roomCode).emit('quiz_finished', {
                    roomCode,
                    leaderboard: leaderboard.data,
                });
                return { success: true, message: 'Quiz finished' };
            }
            await this.sessionsService.updateCurrentQuestion(session.id, nextIndex);
            const nextQuestion = quiz.questions[nextIndex];
            this.server.to(roomCode).emit('new_question', {
                roomCode,
                question: nextQuestion,
                questionIndex: nextIndex,
                totalQuestions: quiz.questions.length,
            });
            return { success: true, message: 'Next question sent' };
        }
        catch (error) {
            return { error: error.message };
        }
    }
    async handleEndQuiz(client, data) {
        try {
            const { roomCode } = data;
            const session = await this.sessionsService.findByRoomCode(roomCode);
            if (session.creatorId !== client.data.userId) {
                return { error: 'Only the session creator can end the quiz' };
            }
            await this.sessionsService.updateStatus(session.id, create_session_dto_1.SessionStatus.FINISHED);
            const leaderboard = await this.resultsService.getLeaderboard(session.id);
            this.server.to(roomCode).emit('quiz_finished', {
                roomCode,
                leaderboard: leaderboard.data,
            });
            this.hostRooms.delete(client.id);
            return { success: true, message: 'Quiz ended' };
        }
        catch (error) {
            return { error: error.message };
        }
    }
};
exports.HostGateway = HostGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], HostGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('start_quiz'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], HostGateway.prototype, "handleStartQuiz", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('next_question'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], HostGateway.prototype, "handleNextQuestion", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('end_quiz'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], HostGateway.prototype, "handleEndQuiz", null);
exports.HostGateway = HostGateway = HostGateway_1 = __decorate([
    (0, websockets_1.WebSocketGateway)({
        namespace: '/host',
        cors: {
            origin: '*',
        },
    }),
    __metadata("design:paramtypes", [sessions_service_1.SessionsService,
        quizzes_service_1.QuizzesService,
        results_service_1.ResultsService])
], HostGateway);
//# sourceMappingURL=host.gateway.js.map