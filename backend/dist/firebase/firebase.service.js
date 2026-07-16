"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var FirebaseService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.FirebaseService = void 0;
const common_1 = require("@nestjs/common");
const app_1 = require("firebase-admin/app");
const firestore_1 = require("firebase-admin/firestore");
const auth_1 = require("firebase-admin/auth");
const fs = require("fs");
let FirebaseService = FirebaseService_1 = class FirebaseService {
    constructor() {
        this.logger = new common_1.Logger(FirebaseService_1.name);
    }
    onModuleInit() {
        try {
            if (!(0, app_1.getApps)().length) {
                const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH || './serviceAccountKey.json';
                if (!fs.existsSync(serviceAccountPath)) {
                    this.logger.warn(`Firebase service account key not found at "${serviceAccountPath}". ` +
                        `Firebase features will be unavailable. Download it from Firebase Console > Project Settings > Service Accounts.`);
                    return;
                }
                const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
                this.app = (0, app_1.initializeApp)({
                    credential: (0, app_1.cert)(serviceAccount),
                    projectId: process.env.FIREBASE_PROJECT_ID,
                });
                this.logger.log('Firebase Admin SDK initialized successfully');
            }
            else {
                this.app = (0, app_1.getApps)()[0];
            }
            this._firestore = (0, firestore_1.getFirestore)(this.app);
            this._auth = (0, auth_1.getAuth)(this.app);
        }
        catch (error) {
            this.logger.error('Failed to initialize Firebase Admin SDK', error);
            throw error;
        }
    }
    get firestore() {
        return this._firestore;
    }
    get auth() {
        return this._auth;
    }
};
exports.FirebaseService = FirebaseService;
exports.FirebaseService = FirebaseService = FirebaseService_1 = __decorate([
    (0, common_1.Injectable)()
], FirebaseService);
//# sourceMappingURL=firebase.service.js.map