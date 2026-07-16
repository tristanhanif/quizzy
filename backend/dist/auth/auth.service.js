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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const bcrypt = require("bcrypt");
const firebase_service_1 = require("../firebase/firebase.service");
let AuthService = class AuthService {
    constructor(firebaseService, jwtService) {
        this.firebaseService = firebaseService;
        this.jwtService = jwtService;
    }
    async register(registerDto) {
        const { fullName, email, password, role } = registerDto;
        const usersRef = this.firebaseService.firestore.collection('users');
        const existingUser = await usersRef.where('email', '==', email).get();
        if (!existingUser.empty) {
            throw new common_1.ConflictException('Email already registered');
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const userRecord = await this.firebaseService.auth.createUser({
            email,
            password,
            displayName: fullName,
        });
        await usersRef.doc(userRecord.uid).set({
            fullName,
            email,
            role,
            provider: 'manual',
            isLinked: false,
            password: hashedPassword,
            createdAt: new Date(),
            updatedAt: new Date(),
        });
        const token = this.generateToken({
            sub: userRecord.uid,
            email,
            role,
        });
        return {
            accessToken: token,
            user: { id: userRecord.uid, name: fullName, role },
        };
    }
    async login(loginDto) {
        const { email, password } = loginDto;
        const usersRef = this.firebaseService.firestore.collection('users');
        const userSnapshot = await usersRef.where('email', '==', email).get();
        if (userSnapshot.empty) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        const userDoc = userSnapshot.docs[0];
        const userData = userDoc.data();
        if (!userData.password) {
            throw new common_1.UnauthorizedException('Account uses Google login. Please sign in with Google.');
        }
        const isPasswordValid = await bcrypt.compare(password, userData.password);
        if (!isPasswordValid) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        const token = this.generateToken({
            sub: userDoc.id,
            email: userData.email,
            role: userData.role,
        });
        return {
            accessToken: token,
            user: { id: userDoc.id, name: userData.fullName, role: userData.role },
        };
    }
    async getProfile(userId) {
        const userDoc = await this.firebaseService.firestore
            .collection('users')
            .doc(userId)
            .get();
        if (!userDoc.exists) {
            throw new common_1.BadRequestException('User not found');
        }
        const userData = userDoc.data();
        return {
            id: userDoc.id,
            fullName: userData.fullName,
            email: userData.email,
            role: userData.role,
            provider: userData.provider,
        };
    }
    async googleLogin(dto) {
        const { idToken } = dto;
        const decodedToken = await this.firebaseService.auth.verifyIdToken(idToken);
        const { email, name, picture, uid: firebaseUid } = decodedToken;
        if (!email) {
            throw new common_1.BadRequestException('Google account has no email');
        }
        const usersRef = this.firebaseService.firestore.collection('users');
        const existingUser = await usersRef.where('email', '==', email).get();
        if (!existingUser.empty) {
            const userDoc = existingUser.docs[0];
            const userData = userDoc.data();
            await userDoc.ref.update({
                provider: userData.provider === 'manual' ? 'manual' : 'google',
                isLinked: userData.provider === 'manual' ? true : userData.isLinked,
                googlePicture: picture || userData.googlePicture,
                updatedAt: new Date(),
            });
            const needsRoleSelection = userData.role === null;
            const token = this.generateToken({
                sub: userDoc.id,
                email,
                role: userData.role,
            });
            return {
                accessToken: token,
                user: {
                    id: userDoc.id,
                    name: userData.fullName,
                    role: userData.role,
                    picture: picture || userData.googlePicture,
                },
                needsRoleSelection,
            };
        }
        const userRecord = await this.firebaseService.auth.createUser({
            email,
            displayName: name,
            photoURL: picture,
        });
        await usersRef.doc(userRecord.uid).set({
            fullName: name,
            email,
            role: null,
            provider: 'google',
            isLinked: false,
            googlePicture: picture || null,
            createdAt: new Date(),
            updatedAt: new Date(),
        });
        const token = this.generateToken({
            sub: userRecord.uid,
            email,
            role: null,
        });
        return {
            accessToken: token,
            user: { id: userRecord.uid, name, role: null, picture },
            needsRoleSelection: true,
        };
    }
    async setRole(userId, dto) {
        const { role } = dto;
        const userDoc = await this.firebaseService.firestore
            .collection('users')
            .doc(userId)
            .get();
        if (!userDoc.exists) {
            throw new common_1.BadRequestException('User not found');
        }
        const userData = userDoc.data();
        if (userData.role !== null) {
            throw new common_1.BadRequestException('Role already set');
        }
        await userDoc.ref.update({
            role,
            updatedAt: new Date(),
        });
        return { success: true };
    }
    generateToken(payload) {
        return this.jwtService.sign(payload);
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [firebase_service_1.FirebaseService,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map