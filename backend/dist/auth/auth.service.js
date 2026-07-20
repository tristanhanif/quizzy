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
const display_id_1 = require("../common/utils/display-id");
let AuthService = class AuthService {
    constructor(firebaseService, jwtService) {
        this.firebaseService = firebaseService;
        this.jwtService = jwtService;
        this.ADMINS = [
            { email: 'tristanhanifganteng@gmail.com', pin: '190309', name: 'Tristan Hanif' },
            { email: 'affanabdullahganteng@gmail.com', pin: '101208', name: 'Affan Abdullah' },
        ];
    }
    async register(registerDto) {
        const { fullName, email, password, role } = registerDto;
        const usersRef = this.firebaseService.firestore.collection('users');
        const existingUser = await usersRef.where('email', '==', email).get();
        if (!existingUser.empty) {
            throw new common_1.ConflictException('Email already registered');
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const displayId = (0, display_id_1.generateDisplayId)(role);
        const userRecord = await this.firebaseService.auth.createUser({
            email,
            password,
            displayName: fullName,
        });
        await usersRef.doc(userRecord.uid).set({
            fullName,
            email,
            role,
            displayId,
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
            user: { id: userRecord.uid, name: fullName, role, displayId },
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
        let displayId = userData.displayId;
        if (!displayId && userData.role) {
            displayId = (0, display_id_1.generateDisplayId)(userData.role);
            await userDoc.ref.update({ displayId, updatedAt: new Date() });
        }
        const token = this.generateToken({
            sub: userDoc.id,
            email: userData.email,
            role: userData.role,
        });
        return {
            accessToken: token,
            user: { id: userDoc.id, name: userData.fullName, role: userData.role, displayId },
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
            displayId: userData.displayId,
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
            let displayId = userData.displayId;
            if (!displayId && userData.role) {
                displayId = (0, display_id_1.generateDisplayId)(userData.role);
                await userDoc.ref.update({ displayId, updatedAt: new Date() });
            }
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
                    displayId: userData.displayId,
                    picture: picture || userData.googlePicture,
                },
                needsRoleSelection,
            };
        }
        await usersRef.doc(firebaseUid).set({
            fullName: name,
            email,
            role: null,
            displayId: null,
            provider: 'google',
            isLinked: false,
            googlePicture: picture || null,
            createdAt: new Date(),
            updatedAt: new Date(),
        });
        const token = this.generateToken({
            sub: firebaseUid,
            email,
            role: null,
        });
        return {
            accessToken: token,
            user: { id: firebaseUid, name, role: null, displayId: null, picture },
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
        const displayId = (0, display_id_1.generateDisplayId)(role);
        await userDoc.ref.update({
            role,
            displayId,
            updatedAt: new Date(),
        });
        return { success: true, displayId };
    }
    generateToken(payload) {
        return this.jwtService.sign(payload);
    }
    async checkAdminEmail(email) {
        const admin = this.ADMINS.find((a) => a.email === email);
        return { isValid: !!admin };
    }
    async adminLogin(dto) {
        const admin = this.ADMINS.find((a) => a.email === dto.email);
        if (!admin) {
            throw new common_1.UnauthorizedException('Email admin tidak terdaftar');
        }
        if (admin.pin !== dto.pin) {
            throw new common_1.UnauthorizedException('PIN admin salah');
        }
        const usersRef = this.firebaseService.firestore.collection('users');
        const existingUser = await usersRef.where('email', '==', dto.email).get();
        let userId;
        if (existingUser.empty) {
            let firebaseUid;
            try {
                const userRecord = await this.firebaseService.auth.createUser({
                    email: dto.email,
                    password: 'admin-google-auth',
                    displayName: admin.name,
                });
                firebaseUid = userRecord.uid;
            }
            catch (authErr) {
                if (authErr.code === 'auth/email-already-exists' || authErr.message?.includes('email-already-exists')) {
                    const userRecord = await this.firebaseService.auth.getUserByEmail(dto.email);
                    firebaseUid = userRecord.uid;
                }
                else {
                    throw authErr;
                }
            }
            const displayId = (0, display_id_1.generateDisplayId)('ADMIN');
            await usersRef.doc(firebaseUid).set({
                fullName: admin.name,
                email: dto.email,
                role: 'ADMIN',
                displayId,
                provider: 'admin',
                isLinked: false,
                createdAt: new Date(),
                updatedAt: new Date(),
            });
            userId = firebaseUid;
        }
        else {
            const userDoc = existingUser.docs[0];
            userId = userDoc.id;
            if (userDoc.data().role !== 'ADMIN') {
                await userDoc.ref.update({ role: 'ADMIN', updatedAt: new Date() });
            }
        }
        const token = this.generateToken({
            sub: userId,
            email: dto.email,
            role: 'ADMIN',
        });
        const userDoc = await usersRef.doc(userId).get();
        const displayId = userDoc.data()?.displayId;
        return {
            accessToken: token,
            user: { id: userId, name: admin.name, role: 'ADMIN', displayId },
        };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [firebase_service_1.FirebaseService,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map