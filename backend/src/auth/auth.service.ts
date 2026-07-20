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

  private readonly ADMINS = [
    { email: 'tristanhanifganteng@gmail.com', pin: '190309', name: 'Tristan Hanif' },
    { email: 'affanabdullahganteng@gmail.com', pin: '101208', name: 'Affan Abdullah' },
  ];

  async checkAdminEmail(email: string) {
    const admin = this.ADMINS.find((a) => a.email === email);
    return { isValid: !!admin };
  }

  async adminLogin(dto: { email: string; pin: string }) {
    const admin = this.ADMINS.find((a) => a.email === dto.email);
    
    if (!admin) {
      throw new UnauthorizedException('Email admin tidak terdaftar');
    }

    if (admin.pin !== dto.pin) {
      throw new UnauthorizedException('PIN admin salah');
    }

    const usersRef = this.firebaseService.firestore.collection('users');
    const existingUser = await usersRef.where('email', '==', dto.email).get();

    let userId: string;

    if (existingUser.empty) {
      let firebaseUid: string;

      // Try to create Firebase Auth user; if email already exists, get the existing one
      try {
        const userRecord = await this.firebaseService.auth.createUser({
          email: dto.email,
          password: 'admin-google-auth',
          displayName: admin.name,
        });
        firebaseUid = userRecord.uid;
      } catch (authErr: any) {
        if (authErr.code === 'auth/email-already-exists' || authErr.message?.includes('email-already-exists')) {
          // Email exists in Firebase Auth but not in Firestore — find it
          const userRecord = await this.firebaseService.auth.getUserByEmail(dto.email);
          firebaseUid = userRecord.uid;
        } else {
          throw authErr;
        }
      }

      const displayId = generateDisplayId('ADMIN');

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
    } else {
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

    return {
      accessToken: token,
      user: { id: userId, name: admin.name, role: 'ADMIN' },
    };
  }
}
