import { serverTimestamp, collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase';

/**
 * Create 4 test chat rooms with different time limits
 * These will appear in "추천 채팅방" (recommend section) in TextChat
 */
export async function createTestChatRooms(): Promise<string[]> {
  const testRooms = [
    {
      title: '[테스트] 5초 대화',
      topics: ['테스트'],
      timeLimit: 5,
    },
    {
      title: '[테스트] 30분 대화',
      topics: ['테스트'],
      timeLimit: 1800,
    },
    {
      title: '[테스트] 5시간 대화',
      topics: ['테스트'],
      timeLimit: 18000,
    },
    {
      title: '[테스트] 무제한 대화',
      topics: ['테스트'],
      timeLimit: null,
    }
  ];

  const createdRoomIds: string[] = [];

  for (const roomData of testRooms) {
    const docRef = await addDoc(collection(db, 'chatRooms'), {
      ...roomData,
      creatorId: 'test-virtual-user-imfine',
      participants: ['test-virtual-user-imfine'],
      status: 'waiting', // IMPORTANT: must be 'waiting' to appear in searchRooms
      createdAt: serverTimestamp(),
      lastMessageAt: serverTimestamp(),
    });
    createdRoomIds.push(docRef.id);
  }

  return createdRoomIds;
}

/**
 * Create 3 friend requests (notifications) with colored icons
 * These will appear in Home.tsx notifications section
 */
export async function createTestFriendRequests(userId: string): Promise<void> {
  const virtualUsers = [
    { name: '친구A', icon: '🔴' },
    { name: '친구B', icon: '🟢' },
    { name: '친구C', icon: '🔵' },
  ];

  for (const user of virtualUsers) {
    await addDoc(collection(db, 'users', userId, 'notifications'), {
      fromUserId: `virtual-${user.name}`,
      fromName: user.name,
      fromIcon: user.icon,
      type: 'friend_request',
      status: 'pending',
      createdAt: serverTimestamp(),
    });
  }
}
