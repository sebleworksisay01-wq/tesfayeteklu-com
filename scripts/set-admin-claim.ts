/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Administrative Provisioning Utility: Assign Custom Admin Claim
 * Target Administrator: contactesfaye@gmail.com
 * Project: tesfayeteklu-com
 */

import * as fs from 'fs';
import * as path from 'path';
import { initializeApp, getApps, getApp, cert, applicationDefault, App } from 'firebase-admin/app';
import { getAuth, UserRecord } from 'firebase-admin/auth';

const TARGET_ADMIN_EMAIL = 'contactesfaye@gmail.com';
const TARGET_PROJECT_ID = 'tesfayeteklu-com';

async function initFirebaseAdmin(): Promise<App> {
  if (getApps().length > 0) {
    return getApp();
  }

  const localKeyPath = path.resolve(process.cwd(), 'serviceAccountKey.json');
  const envKeyPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;

  if (envKeyPath && fs.existsSync(envKeyPath)) {
    console.log(`[AUTH] Using credentials from GOOGLE_APPLICATION_CREDENTIALS: ${envKeyPath}`);
    return initializeApp({
      credential: applicationDefault(),
      projectId: TARGET_PROJECT_ID,
    });
  }

  if (fs.existsSync(localKeyPath)) {
    console.log(`[AUTH] Using credentials from ./serviceAccountKey.json`);
    const serviceAccount = JSON.parse(fs.readFileSync(localKeyPath, 'utf8'));
    return initializeApp({
      credential: cert(serviceAccount),
      projectId: TARGET_PROJECT_ID,
    });
  }

  console.log(`[AUTH] Attempting application default credentials for ${TARGET_PROJECT_ID}...`);
  return initializeApp({
    credential: applicationDefault(),
    projectId: TARGET_PROJECT_ID,
  });
}

async function setAdminClaim() {
  console.log('================================================================');
  console.log(' TesfayeTech: Firebase Custom Claim Provisioning Utility');
  console.log(` Target Admin Account: ${TARGET_ADMIN_EMAIL}`);
  console.log(` Firebase Project:     ${TARGET_PROJECT_ID}`);
  console.log('================================================================\n');

  try {
    const app = await initFirebaseAdmin();
    const auth = getAuth(app);

    console.log(`[1/3] Looking up Firebase Auth account for ${TARGET_ADMIN_EMAIL}...`);
    let userRecord: UserRecord;

    try {
      userRecord = await auth.getUserByEmail(TARGET_ADMIN_EMAIL);
      console.log(`✓ Found user account: UID=${userRecord.uid}, Verified=${userRecord.emailVerified}`);
    } catch (lookupErr: any) {
      if (lookupErr?.code === 'auth/user-not-found') {
        console.error(`\n❌ Error: User ${TARGET_ADMIN_EMAIL} was not found in Firebase Auth.`);
        console.error(`Please first register the account at /admin/login or in the Firebase Console.`);
        process.exit(1);
      }
      throw lookupErr;
    }

    if (!userRecord.emailVerified) {
      console.warn(`\n⚠️ Notice: Account email is currently unverified. Marking verified...`);
      await auth.updateUser(userRecord.uid, { emailVerified: true });
      console.log(`✓ Email verification status updated to TRUE.`);
    }

    console.log(`\n[2/3] Assigning trusted custom claim { admin: true }...`);
    await auth.setCustomUserClaims(userRecord.uid, {
      ...(userRecord.customClaims || {}),
      admin: true,
      role: 'super_admin',
    });
    console.log(`✓ Custom claim successfully set on user ${userRecord.uid}!`);

    console.log(`\n[3/3] Verifying newly applied claims...`);
    const verifiedUser = await auth.getUser(userRecord.uid);
    console.log(`✓ Verified claims on record:`, JSON.stringify(verifiedUser.customClaims, null, 2));

    console.log('\n================================================================');
    console.log(' SUCCESS: Administrator authorization claim { admin: true } is active!');
    console.log(' NOTE: The user must sign out and sign back in (or refresh token) to activate.');
    console.log('================================================================\n');
  } catch (error: any) {
    console.error('\n❌ Execution error:', error.message || error);
    process.exit(1);
  }
}

setAdminClaim();
