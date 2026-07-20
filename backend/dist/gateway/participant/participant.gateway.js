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
var ParticipantGateway_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParticipantGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const common_1 = require("@nestjs/common");
const jwt = require("jsonwebtoken");
const sessions_service_1 = require("../../sessions/sessions.service");
const results_service_1 = require("../../results/results.service");
let ParticipantGateway = ParticipantGateway_1 = class ParticipantGateway {
    constructor(sessionsService, resultsService) {
        this.sessionsService = sessionsService;
        this.resultsService = resultsService;
        this.logger = new common_1.Logger(ParticipantGateway_1.name);
        this.participantRooms = new Map();
    }
    afterInit(server) {
        this.logger.log('Participant Gateway initialized');
    }
    handleConnection(client) {
        try {
            const token = client.handshake.auth?.token;
            if (token) {
                const payload = jwt.verify(token, process.env.JWT_SECRET || 'quizzy-secret-key');
                client.data.userId = payload.sub;
                this.logger.log(`Participant connected: ${client.id} (user: ${client.data.userId})`);
            }
            else {
                this.logger.warn(`Participant connected without token: ${client.id}`);
            }
        }
        catch (err) {
            this.logger.error(`Participant auth failed: ${err.message}`);
            client.disconnect();
        }
    }
    handleDisconnect(client) {
        this.logger.log(`Participant disconnected: ${client.id}`);
        this.participantRooms.delete(client.id);
    }
    async handleJoinRoom(client, data) {
        try {
            const { roomCode, userId } = data;
            const session = await this.sessionsService.findByRoomCode(roomCode);
            if (!session.participants.includes(userId)) {
                return { error: 'You are not a participant in this session' };
            }
            client.join(roomCode);
            this.participantRooms.set(client.id, roomCode);
            this.server.to(roomCode).emit('participant_joined', {
                participantId: userId,
                participantCount: session.participants.length,
            });
            return { success: true, message: 'Joined room' };
        }
        catch (error) {
            return { error: error.message };
        }
    }
    async handleSubmitAnswer(client, data) {
        try {
            const { roomCode, userId, questionId, answer } = data;
            const session = await this.sessionsService.findByRoomCode(roomCode);
            const participantDoc = await this.sessionsService.getParticipants(session.id);
            const participant = participantDoc.data.find((p) => p.userId === userId);
            if (!participant) {
                return { error: 'Participant not found' };
            }
            const quizDoc = await this.sessionsService.findOne(session.id);
            this.server.to(roomCode).emit('answer_submitted', {
                userId,
                questionId,
                timestamp: new Date(),
            });
            return { success: true, message: 'Answer submitted' };
        }
        catch (error) {
            return { error: error.message };
        }
    }
    async handleReconnect(client, data) {
        try {
            const { roomCode, userId } = data;
            const session = await this.sessionsService.findByRoomCode(roomCode);
            if (!session.participants.includes(userId)) {
                return { error: 'You are not a participant in this session' };
            }
            client.join(roomCode);
            this.participantRooms.set(client.id, roomCode);
            return {
                success: true,
                message: 'Reconnected',
                session: {
                    id: session.id,
                    status: session.status,
                    currentQuestionIndex: session.currentQuestionIndex,
                },
            };
        }
        catch (error) {
            return { error: error.message };
        }
    }
};
exports.ParticipantGateway = ParticipantGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], ParticipantGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('join_room'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], ParticipantGateway.prototype, "handleJoinRoom", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('submit_answer'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], ParticipantGateway.prototype, "handleSubmitAnswer", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('reconnect'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], ParticipantGateway.prototype, "handleReconnect", null);
exports.ParticipantGateway = ParticipantGateway = ParticipantGateway_1 = __decorate([
    (0, websockets_1.WebSocketGateway)({
        namespace: '/participant',
        cors: {
            origin: '*',
        },
    }),
    __metadata("design:paramtypes", [sessions_service_1.SessionsService,
        results_service_1.ResultsService])
], ParticipantGateway);
//# sourceMappingURL=participant.gateway.js.map