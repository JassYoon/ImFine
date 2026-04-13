import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  addDoc,
  deleteDoc,
  runTransaction,
  query,
  where,
  serverTimestamp,
  arrayUnion,
  arrayRemove,
} from 'firebase/firestore';
import { db } from '../firebase';
import type { FriendCardData, FriendRequest } from '../types';
import { TESTER_UID } from '../types';

export const friendRequestsCol = () => collection(db, 'friendRequests');

export async function sendFriendRequest(
  from: { uid: string; name: string; photo?: string; icon?: string },
  to: { uid: string; name?: string; photo?: string; icon?: string },
) {
  if (from.uid === to.uid) throw new Error('본인에게는 친구 신청할 수 없습니다.');

  const q = query(
    friendRequestsCol(),
    where('fromId', '==', from.uid),
    where('toId', '==', to.uid),
    where('status', '==', 'pending'),
  );
  const { getDocs } = await import('firebase/firestore');
  const existing = await getDocs(q);
  if (!existing.empty) throw new Error('이미 친구 신청 중입니다.');

  await addDoc(friendRequestsCol(), {
    fromId: from.uid,
    fromName: from.name,
    fromPhoto: from.photo ?? null,
    fromIcon: from.icon ?? null,
    toId: to.uid,
    toName: to.name ?? null,
    toPhoto: to.photo ?? null,
    toIcon: to.icon ?? null,
    status: 'pending',
    createdAt: serverTimestamp(),
  });
}

// Contract: both `fromId` and `toId` user docs MUST exist before calling.
// Real users are auto-created in App.tsx on auth; synthetic/test users
// (e.g. 'tester') must be seeded via seedTesterUser() or test-data flow first.
export async function acceptFriendRequest(req: FriendRequest) {
  await runTransaction(db, async (tx) => {
    const reqRef = doc(db, 'friendRequests', req.id);
    const fromRef = doc(db, 'users', req.fromId);
    const toRef = doc(db, 'users', req.toId);
    tx.update(reqRef, { status: 'accepted' });
    tx.update(fromRef, { friends: arrayUnion(req.toId) });
    tx.update(toRef, { friends: arrayUnion(req.fromId) });
  });
  await deleteDoc(doc(db, 'friendRequests', req.id));
}

export async function rejectFriendRequest(reqId: string) {
  await deleteDoc(doc(db, 'friendRequests', reqId));
}

export async function cancelFriendRequest(reqId: string) {
  await deleteDoc(doc(db, 'friendRequests', reqId));
}

export async function removeFriend(myUid: string, friendUid: string) {
  await Promise.all([
    updateDoc(doc(db, 'users', myUid), { friends: arrayRemove(friendUid) }),
    updateDoc(doc(db, 'users', friendUid), { friends: arrayRemove(myUid) }),
  ]);
}

export async function fetchUserCards(uids: string[]): Promise<FriendCardData[]> {
  const unique = Array.from(new Set(uids));
  const results = await Promise.all(
    unique.map(async (uid) => {
      const snap = await getDoc(doc(db, 'users', uid));
      if (!snap.exists()) {
        return { uid, nickname: uid, profileIcon: undefined } as FriendCardData;
      }
      const d = snap.data() as any;
      return {
        uid,
        nickname: d.nickname || d.displayName || uid,
        photoURL: d.photoURL,
        profileIcon: d.profileIcon,
      } as FriendCardData;
    }),
  );
  return results;
}

export async function seedTesterUser() {
  const ref = doc(db, 'users', TESTER_UID);
  await setDoc(
    ref,
    {
      uid: TESTER_UID,
      nickname: 'tester',
      displayName: 'tester',
      profileIcon: 'yellow',
      email: 'tester@imfine.local',
      role: 'user',
    },
    { merge: true },
  );
}
