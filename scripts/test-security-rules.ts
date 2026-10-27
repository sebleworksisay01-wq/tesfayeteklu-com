/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Security Rules Verification & Audit Test Runner
 * Evaluates Firestore and Storage Security Rules Logic Gates
 */

export interface SecurityTestCase {
  id: string;
  category: 'Firestore' | 'Storage';
  description: string;
  auth: {
    uid?: string;
    email?: string;
    email_verified?: boolean;
    admin?: boolean;
  } | null;
  path: string;
  operation: 'get' | 'list' | 'create' | 'update' | 'delete';
  resourceData?: Record<string, unknown>;
  requestData?: Record<string, unknown>;
  fileMetadata?: {
    contentType: string;
    size: number;
  };
  expectedResult: 'ALLOW' | 'DENY';
}

export const TEST_CASES: SecurityTestCase[] = [
  // ----------------------------------------------------
  // Public Visitor Tests (Unauthenticated)
  // ----------------------------------------------------
  {
    id: 'SEC-01',
    category: 'Firestore',
    description: 'Public visitor can read published projects',
    auth: null,
    path: 'projects/web-app-01',
    operation: 'get',
    resourceData: { published: true },
    expectedResult: 'ALLOW',
  },
  {
    id: 'SEC-02',
    category: 'Firestore',
    description: 'Public visitor is DENIED reading unpublished draft projects',
    auth: null,
    path: 'projects/draft-app-01',
    operation: 'get',
    resourceData: { published: false },
    expectedResult: 'DENY',
  },
  {
    id: 'SEC-03',
    category: 'Firestore',
    description: 'Public visitor is DENIED creating or writing projects',
    auth: null,
    path: 'projects/malicious-inject',
    operation: 'create',
    requestData: { name: 'Hacked Demo', published: true },
    expectedResult: 'DENY',
  },
  {
    id: 'SEC-04',
    category: 'Firestore',
    description: 'Public visitor is DENIED reading client inquiries in Firestore',
    auth: null,
    path: 'inquiries/inq-12345',
    operation: 'get',
    expectedResult: 'DENY',
  },
  {
    id: 'SEC-05',
    category: 'Firestore',
    description: 'Public visitor is DENIED listing client inquiries in Firestore',
    auth: null,
    path: 'inquiries',
    operation: 'list',
    expectedResult: 'DENY',
  },
  {
    id: 'SEC-06',
    category: 'Firestore',
    description: 'Public visitor is DENIED direct client-side inquiry creation in Firestore (forces /api/inquiries)',
    auth: null,
    path: 'inquiries/inq-12345',
    operation: 'create',
    requestData: { fullName: 'Anonymous spammer', email: 'spam@bot.com' },
    expectedResult: 'DENY',
  },
  {
    id: 'SEC-07',
    category: 'Firestore',
    description: 'Public visitor is DENIED reading protected administrative data',
    auth: null,
    path: 'adminData/audit-log',
    operation: 'get',
    expectedResult: 'DENY',
  },
  {
    id: 'SEC-08',
    category: 'Firestore',
    description: 'Public visitor is DENIED reading private site settings',
    auth: null,
    path: 'siteSettings/private_keys',
    operation: 'get',
    resourceData: { isPrivate: true },
    expectedResult: 'DENY',
  },

  // ----------------------------------------------------
  // Spoofed & Unverified Admin Tests
  // ----------------------------------------------------
  {
    id: 'SEC-09',
    category: 'Firestore',
    description: 'User with correct email but email_verified == false is DENIED admin access',
    auth: {
      uid: 'spoofed-uid',
      email: 'contactesfaye@gmail.com',
      email_verified: false,
      admin: true,
    },
    path: 'projects/new-project',
    operation: 'create',
    requestData: { name: 'Spoofed Write' },
    expectedResult: 'DENY',
  },
  {
    id: 'SEC-10',
    category: 'Firestore',
    description: 'User with verified email but MISSING custom claim admin: true is DENIED admin access',
    auth: {
      uid: 'user-no-claim',
      email: 'contactesfaye@gmail.com',
      email_verified: true,
      admin: false,
    },
    path: 'projects/new-project',
    operation: 'create',
    requestData: { name: 'Write Without Claim' },
    expectedResult: 'DENY',
  },
  {
    id: 'SEC-11',
    category: 'Firestore',
    description: 'Non-admin user cannot self-assign role or admin claims in /users/{userId}',
    auth: {
      uid: 'random-client-uid',
      email: 'client@example.com',
      email_verified: true,
      admin: false,
    },
    path: 'users/random-client-uid',
    operation: 'create',
    requestData: {
      displayName: 'Attacker',
      role: 'super_admin',
      isAdmin: true,
    },
    expectedResult: 'DENY',
  },

  // ----------------------------------------------------
  // Verified Administrator with Custom Claim Tests
  // ----------------------------------------------------
  {
    id: 'SEC-12',
    category: 'Firestore',
    description: 'Authorized Admin (verified + claim) can create new portfolio project',
    auth: {
      uid: 'authorized-admin-uid',
      email: 'contactesfaye@gmail.com',
      email_verified: true,
      admin: true,
    },
    path: 'projects/demo-solution-01',
    operation: 'create',
    requestData: { name: 'Valid Project', published: true },
    expectedResult: 'ALLOW',
  },
  {
    id: 'SEC-13',
    category: 'Firestore',
    description: 'Authorized Admin (verified + claim) can read client inquiries',
    auth: {
      uid: 'authorized-admin-uid',
      email: 'contactesfaye@gmail.com',
      email_verified: true,
      admin: true,
    },
    path: 'inquiries/inq-98765',
    operation: 'get',
    expectedResult: 'ALLOW',
  },

  // ----------------------------------------------------
  // Storage Security Rules Tests
  // ----------------------------------------------------
  {
    id: 'SEC-14',
    category: 'Storage',
    description: 'Public visitor can read public project screenshots',
    auth: null,
    path: 'projects/screenshot.webp',
    operation: 'get',
    expectedResult: 'ALLOW',
  },
  {
    id: 'SEC-15',
    category: 'Storage',
    description: 'Public visitor is DENIED uploading images to /projects/',
    auth: null,
    path: 'projects/hack.png',
    operation: 'create',
    fileMetadata: { contentType: 'image/png', size: 1024 * 1024 },
    expectedResult: 'DENY',
  },
  {
    id: 'SEC-16',
    category: 'Storage',
    description: 'Authorized Admin (verified + claim) can upload valid image <= 10MB',
    auth: {
      uid: 'authorized-admin-uid',
      email: 'contactesfaye@gmail.com',
      email_verified: true,
      admin: true,
    },
    path: 'projects/hero.png',
    operation: 'create',
    fileMetadata: { contentType: 'image/png', size: 2 * 1024 * 1024 },
    expectedResult: 'ALLOW',
  },
  {
    id: 'SEC-17',
    category: 'Storage',
    description: 'Authorized Admin is DENIED uploading file exceeding 10MB limit',
    auth: {
      uid: 'authorized-admin-uid',
      email: 'contactesfaye@gmail.com',
      email_verified: true,
      admin: true,
    },
    path: 'projects/huge-video.mp4',
    operation: 'create',
    fileMetadata: { contentType: 'video/mp4', size: 25 * 1024 * 1024 },
    expectedResult: 'DENY',
  },
  {
    id: 'SEC-18',
    category: 'Storage',
    description: 'Public visitor is DENIED accessing confidential specification documents',
    auth: null,
    path: 'documents/architecture-spec.pdf',
    operation: 'get',
    expectedResult: 'DENY',
  },
];

/**
 * Simulates evaluation against Firestore & Storage Rules logic
 */
function evaluateRule(test: SecurityTestCase): 'ALLOW' | 'DENY' {
  const isAdmin = 
    test.auth != null &&
    test.auth.email_verified === true &&
    test.auth.email === 'contactesfaye@gmail.com' &&
    test.auth.admin === true;

  if (test.category === 'Firestore') {
    if (test.path.startsWith('projects/')) {
      if (test.operation === 'get' || test.operation === 'list') {
        if (test.resourceData?.published === true || isAdmin) return 'ALLOW';
        return 'DENY';
      }
      if (['create', 'update', 'delete'].includes(test.operation)) {
        return isAdmin ? 'ALLOW' : 'DENY';
      }
    }

    if (test.path.startsWith('siteSettings/')) {
      if (test.operation === 'get' || test.operation === 'list') {
        if (test.resourceData?.isPrivate !== true || isAdmin) return 'ALLOW';
        return 'DENY';
      }
      return isAdmin ? 'ALLOW' : 'DENY';
    }

    if (test.path.startsWith('inquiries/')) {
      return isAdmin ? 'ALLOW' : 'DENY';
    }

    if (test.path.startsWith('adminData/')) {
      return isAdmin ? 'ALLOW' : 'DENY';
    }

    if (test.path.startsWith('users/')) {
      if (test.operation === 'create') {
        const hasRoleAssigned = test.requestData?.role != null || test.requestData?.isAdmin != null;
        if (hasRoleAssigned && !isAdmin) return 'DENY';
        if (test.auth && test.path === `users/${test.auth.uid}`) return 'ALLOW';
        return 'DENY';
      }
    }
  }

  if (test.category === 'Storage') {
    if (test.path.startsWith('projects/') || test.path.startsWith('branding/')) {
      if (test.operation === 'get') return 'ALLOW';
      if (test.operation === 'create' || test.operation === 'update') {
        const isValidImage = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'].includes(
          test.fileMetadata?.contentType || ''
        );
        const isUnder10MB = (test.fileMetadata?.size || 0) <= 10 * 1024 * 1024;
        return isAdmin && isValidImage && isUnder10MB ? 'ALLOW' : 'DENY';
      }
      if (test.operation === 'delete') return isAdmin ? 'ALLOW' : 'DENY';
    }

    if (test.path.startsWith('documents/')) {
      return isAdmin ? 'ALLOW' : 'DENY';
    }
  }

  return 'DENY';
}

export function runSecuritySuite() {
  console.log('================================================================');
  console.log(' TesfayeTech Security Rules Verification Suite');
  console.log('================================================================\n');

  let passed = 0;
  let failed = 0;

  for (const test of TEST_CASES) {
    const actual = evaluateRule(test);
    const isPass = actual === test.expectedResult;

    if (isPass) {
      passed++;
      console.log(`✓ [${test.id}] ${test.description} -> ${actual}`);
    } else {
      failed++;
      console.error(`❌ [${test.id}] FAIL: Expected ${test.expectedResult}, but received ${actual}`);
    }
  }

  console.log(`\nResults: ${passed} passed, ${failed} failed out of ${TEST_CASES.length} assertions.`);
  if (failed > 0) {
    process.exit(1);
  }
}

if (process.argv[1] && process.argv[1].endsWith('test-security-rules.ts')) {
  runSecuritySuite();
}
