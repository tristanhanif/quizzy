import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { FirebaseService } from '../firebase/firebase.service';
import { RegisterDto, LoginDto, SetRoleDto } from './dto/register.dto';
import { generateDisplayId } from '../common/utils/display-id';

@Injectable()
export class AuthService {
  constructor(
    private readonly firebaseService: FirebaseService,
    private readonly jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { fullName, email, password, role } = registerDto;

    const usersRef = this.firebaseService.firestore.collection('users');
    const existingUser = await usersRef.where('email', '==', email).get();

    if (!existingUser.empty) {
      throw new ConflictException('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const displayId = generateDisplayId(role);

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

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const usersRef = this.firebaseService.firestore.collection('users');
    const userSnapshot = await usersRef.where('email', '==', email).get();

    if (userSnapshot.empty) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const userDoc = userSnapshot.docs[0];
    const userData = userDoc.data();

    if (!userData.password) {
      throw new UnauthorizedException('Account uses Google login. Please sign in with Google.');
    }

    const isPasswordValid = await bcrypt.compare(password, userData.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const token = this.generateToken({
      sub: userDoc.id,
      email: userData.email,
      role: userData.role,
    });

    return {
      accessToken: token,
      user: { id: userDoc.id, name: userData.fullName, role: userData.role, displayId: userData.displayId },
    };
  }

  async getProfile(userId: string) {
    const userDoc = await this.firebaseService.firestore
      .collection('users')
      .doc(userId)
      .get();

    if (!userDoc.exists) {
      throw new BadRequestException('User not found');
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

  async googleLogin(dto: { idToken: string }) {
    const { idToken } = dto;

    const decodedToken = await this.firebaseService.auth.verifyIdToken(idToken);
    const { email, name, picture, uid: firebaseUid } = decodedToken;

    if (!email) {
      throw new BadRequestException('Google account has no email');
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
          displayId: userData.displayId,
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
      displayId: null,
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
      user: { id: userRecord.uid, name, role: null, displayId: null, picture },
      needsRoleSelection: true,
    };
  }

  async setRole(userId: string, dto: SetRoleDto) {
    const { role } = dto;

    const userDoc = await this.firebaseService.firestore
      .collection('users')
      .doc(userId)
      .get();

    if (!userDoc.exists) {
      throw new BadRequestException('User not found');
    }

    const userData = userDoc.data();

    if (userData.role !== null) {
      throw new BadRequestException('Role already set');
    }

    const displayId = generateDisplayId(role);

    await userDoc.ref.update({
      role,
      displayId,
      updatedAt: new Date(),
    });

    return { success: true, displayId };
  }

  generateToken(payload: { sub: string; email: string; role: string }) {
    return this.jwtService.sign(payload);
  }
}
