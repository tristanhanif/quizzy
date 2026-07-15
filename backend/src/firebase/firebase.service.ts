import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { initializeApp, cert, getApps, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { getAuth, Auth } from 'firebase-admin/auth';
import * as fs from 'fs';

@Injectable()
export class FirebaseService implements OnModuleInit {
  private readonly logger = new Logger(FirebaseService.name);
  private app: App;
  private _firestore: Firestore;
  private _auth: Auth;

  onModuleInit() {
    try {
      if (!getApps().length) {
        const serviceAccount = JSON.parse(
          fs.readFileSync('./serviceAccountKey.json', 'utf8'),
        );

        this.app = initializeApp({
          credential: cert(serviceAccount),
          projectId: process.env.FIREBASE_PROJECT_ID,
        });
        this.logger.log('Firebase Admin SDK initialized successfully');
      } else {
        this.app = getApps()[0];
      }
      this._firestore = getFirestore(this.app);
      this._auth = getAuth(this.app);
    } catch (error) {
      this.logger.error('Failed to initialize Firebase Admin SDK', error);
      throw error;
    }
  }

  get firestore(): Firestore {
    return this._firestore;
  }

  get auth(): Auth {
    return this._auth;
  }
}
