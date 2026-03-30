// devtools.ts

export function generateTestChatRoomData(numRooms: number) {
    const chatRooms = [];
    for (let i = 0; i < numRooms; i++) {
        chatRooms.push({
            id: i + 1,
            name: `Chat Room ${i + 1}`,
            createdAt: new Date().toISOString(),
            users: [] // Add user IDs to this array for testing
        });
    }
    return chatRooms;
}

export function generateTestFriendRequestData(numRequests: number, userId: number) {
    const friendRequests = [];
    for (let i = 0; i < numRequests; i++) {
        friendRequests.push({
            id: i + 1,
            fromUserId: userId,
            toUserId: userId + i + 1,
            status: 'pending',
            createdAt: new Date().toISOString()
        });
    }
    return friendRequests;
}
