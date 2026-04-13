import {
  addDoc,
  collection,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  where,
  writeBatch,
  doc,
} from 'firebase/firestore';
import { db } from '../firebase';

// Virtual user identities used by test-data seeding. Their uids use the
// `test-*` prefix, which firestore.rules allows as an exception for
// friendRequest creation in dev.
export const TEST_USERS = {
  A: { uid: 'test-user-A', name: 'A', icon: 'white' },
  B: { uid: 'test-user-B', name: 'B', icon: 'blue' },
  C: { uid: 'test-user-C', name: 'C', icon: 'pink' },
  D: { uid: 'test-user-D', name: 'D', icon: 'green' },
} as const;

async function clearMyTestFriendRequests(myUid: string) {
  const [incoming, outgoing] = await Promise.all([
    getDocs(query(collection(db, 'friendRequests'), where('toId', '==', myUid))),
    getDocs(query(collection(db, 'friendRequests'), where('fromId', '==', myUid))),
  ]);
  const batch = writeBatch(db);
  const touch = (id: string) => batch.delete(doc(db, 'friendRequests', id));
  incoming.forEach((d) => {
    if ((d.data() as any).fromId?.startsWith?.('test-')) touch(d.id);
  });
  outgoing.forEach((d) => {
    if ((d.data() as any).toId?.startsWith?.('test-')) touch(d.id);
  });
  await batch.commit();
}

async function seedTestUsers(): Promise<void> {
  const all = Object.values(TEST_USERS);
  await Promise.all(
    all.map((u) =>
      setDoc(
        doc(db, 'users', u.uid),
        {
          uid: u.uid,
          displayName: u.name,
          nickname: u.name,
          profileIcon: u.icon,
          email: `${u.uid}@imfine.local`,
          role: 'user',
        },
        { merge: true },
      ),
    ),
  );
}

/**
 * Seed test friend requests:
 * - Incoming to me: A (white), B (blue), C (pink)
 * - Outgoing from me: D (green)
 * Also seeds the test user docs so accept/reject works end-to-end.
 * Clears existing test-* friend requests involving me first to allow re-runs.
 */
export async function seedTestFriendRequests(
  me: { uid: string; name: string; photo?: string },
): Promise<void> {
  await seedTestUsers();
  await clearMyTestFriendRequests(me.uid);

  const incoming = [TEST_USERS.A, TEST_USERS.B, TEST_USERS.C];
  for (const u of incoming) {
    await addDoc(collection(db, 'friendRequests'), {
      fromId: u.uid,
      fromName: u.name,
      fromIcon: u.icon,
      fromPhoto: null,
      toId: me.uid,
      toName: me.name,
      toPhoto: me.photo ?? null,
      toIcon: null,
      status: 'pending',
      createdAt: serverTimestamp(),
    });
  }

  const d = TEST_USERS.D;
  await addDoc(collection(db, 'friendRequests'), {
    fromId: me.uid,
    fromName: me.name,
    fromPhoto: me.photo ?? null,
    fromIcon: null,
    toId: d.uid,
    toName: d.name,
    toIcon: d.icon,
    toPhoto: null,
    status: 'pending',
    createdAt: serverTimestamp(),
  });
}
