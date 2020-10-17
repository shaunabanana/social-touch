import json
import websockets


class User:
    def __init__(self, connection, uid, name):
        self.connection = connection
        self.id = uid
        self.name = name

    def __eq__(self, user):
        return self.id == user.id

    def __hash__(self):
        return self.id

    def __str__(self):
        return f'{self.name}({self.id})'

    def __repr__(self):
        return f'{self.name}({self.id})'

    async def send(self, message):
        await self.connection.send(json.dumps(message))



class Room:
    def __init__(self, maxusers=4):
        self.users = {}
        self.trash = []
        self.max = maxusers

    def __getitem__(self, uid):
        return self.users[uid]

    def __len__(self):
        return len(self.users)

    def __str__(self):
        return self.users.__str__()

    def __repr__(self):
        return self.users.__repr__()

    def isfull(self):
        return len(self.users) >= self.max

    def isempty(self):
        return len(self.users) == 0

    async def _cleanup(self):
        remaining = [user for user in self.users if user not in self.trash]
        for user in self.trash:
            for peer in remaining:
                await peer.send({
                    'message': 'leave',
                    'id': self.users[user].id,
                    'name': self.users[user].name
                })
            del self.users[user]
        self.trash = []

    async def add(self, user):
        if self.isfull():
            return
        self.users[user.id] = user

        for uid in self.users:
            if user.id != uid:
                await user.send({
                    'message': 'join',
                    'id': self.users[uid].id,
                    'name': self.users[uid].name
                })

                await self.users[uid].send({
                    'message': 'join',
                    'id': user.id,
                    'name': user.name
                })

    async def remove(self, uid):
        await self.publish(uid, {
            'message': 'leave',
            'id': uid,
            'name': self.users[uid].name
        })
        del self.users[uid]
        

    async def publish(self, uid, message):
        if uid not in self.users:
            return
        for peerid in self.users:
            if peerid != uid:
                try:
                    await self.users[peerid].send(message)
                except websockets.exceptions.ConnectionClosedOK:
                    print('Error when sending message to theother user. Probably the other user left as well.')
                    self.trash.append(peerid)
                finally:
                    continue
        await self._cleanup()

        
        


class RoomManager:
    def __init__(self):
        self.rooms = [ Room() ]

    async def add(self, connection, uid, name):
        user = User(connection, uid, name)
        self.rooms.sort(key=lambda room: len(room))

        for room in self.rooms:
            if not room.isfull():
                await room.add(user)
                return
        
        self.rooms.append(Room())
        await self.rooms[-1].add(user)

    async def remove(self, uid):
        for room in self.rooms:
            try:
                await room.remove(uid)
            except KeyError:
                pass
        self.rooms = [room for room in self.rooms if not room.isempty()]

    async def publish(self, uid, message):
        for room in self.rooms:
            await room.publish(uid, message)


if __name__ == '__main__':
    manager = RoomManager()
    for i in range(10):
        manager.add(None, str(i), 'User')

        if i == 5:
            manager.remove('3')
            manager.remove('1')
        if i == 7:
            manager.remove('2')

        if i == 8:
            manager.remove('0')
            manager.remove('5')

        print(manager.rooms)
    