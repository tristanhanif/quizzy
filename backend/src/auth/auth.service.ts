import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { FirebaseService } from '../firebase/firebase.service';
import { RegisterDto, LoginDto } from './dto/register.dto';

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

    const userRecord = await this.firebaseService.auth.createUser({
      email,
      password,
      displayName: fullName,
    });

    await usersRef.doc(userRecord.uid).set({
      fullName,
      email,
      role,
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
      user: {
        id: userRecord.uid,
        name: fullName,
        role,
      },
    };
  }

  async login(loginDto: LoginDto) {
    const { email, fullName, password } = loginDto;

    if (!email && !fullName) {
      throw new BadRequestException('Email or fullName is required');
    }

    const usersRef = this.firebaseService.firestore.collection('users');
    let userSnapshot;

    if (email) {
      userSnapshot = await usersRef.where('email', '==', email).get();
    } else {
      userSnapshot = await usersRef.where('fullName', '==', fullName).get();
    }

    if (userSnapshot.empty) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const userDoc = userSnapshot.docs[0];
    const userData = userDoc.data();

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
      user: {
        id: userDoc.id,
        name: userData.fullName,
        role: userData.role,
      },
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
    };
  }

  private generateToken(payload: { sub: string; email: string; role: string }) {
    return this.jwtService.sign(payload);
  }
}
