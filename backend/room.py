import json
import random
import asyncio
import datetime
import websockets

from game import GetOthersToFollowGame, TouchDotGame

GAMES = {
    'GetOthersToFollowGame': GetOthersToFollowGame,
    'TouchDotGame': TouchDotGame
}

class User:
    def __init__(self, connection, uid, name):
        self.connection = connection
        self.id = uid
        self.name = name
        self.currentGame = None

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
    def __init__(self, index, maxusers=2):
        self.id = index
        self.max = maxusers

        self.users = {}
        self.trash = []
        self.names = {
            'Anonymous Bear': False,
            'Anonymous Bird': False,
            'Anonymous Buffalo': False,
            'Anonymous Cat': False
        }
        
        self.ready = set()
        self.game = None
        self.gameObject = None

    def __getitem__(self, uid):
        return self.users[uid]

    def __len__(self):
        return len(self.users)

    def __str__(self):
        return self.users.__str__()

    def __repr__(self):
        return self.users.__repr__()

    def keys(self):
        return self.users.keys()

    def isfull(self):
        return len(self.users) >= self.max

    def isempty(self):
        return len(self.users) == 0

    async def log(self, message):
        out = json.dumps({
            'time': datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S,%f'),
            'room': self.id,
            'message': message
        })
        print(out)


    async def _cleanup(self):
        remaining = [user for user in self.users if user not in self.trash]
        self.trash += [user for user in self.users if self.users[user].connection.closed]
        print('Removing users', self.trash)
        for user in self.trash:
            for peer in remaining:
                try:
                    await self.users[peer].send({
                        'message': 'leave',
                        'id': self.users[user].id,
                        'name': self.users[user].name
                    })
                    self.names[self.users[user].name.replace(' (You)', '')] = False
                except:
                    # print('Error when sending to user', self.users[peer])
                    pass
            del self.users[user]
        self.trash = []

    async def add(self, user):
        if self.isfull():
            return
        self.users[user.id] = user

        result = None
        for name in self.names:
            if not self.names[name]:
                result = name
                self.names[name] = True
                break

        if len(user.name) == 0:
            user.name = result
            await user.send({
                'message': 'name',
                'id': user.id,
                'name': user.name
            })
        
        user.icon = result
        await user.send({
            'message': 'icon',
            'id': user.id,
            'name': result
        })


        for uid in self.users:
            if user.id != uid:
                await user.send({
                    'message': 'join',
                    'id': self.users[uid].id,
                    'name': self.users[uid].name,
                    'icon': self.users[uid].icon
                })

                await self.users[uid].send({
                    'message': 'join',
                    'id': user.id,
                    'name': user.name,
                    'icon': user.icon
                })

        await self.log({
            'event': 'join',
            'id': user.id,
            'name': user.name,
            'icon': user.icon
        })

    async def remove(self, uid):
        # print('Removing user', uid)
        await self.publish(uid, {
            'message': 'leave',
            'id': uid,
            'name': self.users[uid].name
        })
        
        await self.log({
            'event': 'leave',
            'id': self.users[uid].id,
            'name': self.users[uid].name,
            'icon': self.users[uid].icon
        })

        self.names[self.users[uid].name] = False
        del self.users[uid]
        self.ready.remove(uid)
        

    async def publish(self, uid, message):
        if uid not in self.users:
            return
        for peerid in self.users:
            if peerid != uid:
                try:
                    await self.users[peerid].send(message)
                except websockets.exceptions.ConnectionClosedOK:
                    # print('Error when sending message to the other user. Probably the other user left as well.')
                    self.trash.append(peerid)
                finally:
                    pass
        await self.log({
            'event': message['message'],
            'id': self.users[uid].id,
            'name': self.users[uid].name,
            'icon': self.users[uid].icon,
            'data': message['data']
        })
        if len(self.trash) > 0:
            await self._cleanup()

    async def announce(self, message):
        for uid in self.users:
            try:
                await self.users[uid].send(message)
            except websockets.exceptions.ConnectionClosedOK:
                # print('Error when sending message to the other user. Probably the other user left as well.')
                self.trash.append(uid)
            finally:
                pass

        await self.log({
            'event': message['message'],
            'id': 'announcement',
            'name': 'announcement',
            'data': message['data'] if 'data' in message else '',
            'command': message['command'] if 'command' in message else ''
        })

        if len(self.trash) > 0:
            await self._cleanup()

    # def startGame(self, uid, game):
    #     if uid not in self.users:
    #         return
    #     self.users[uid].currentGame = game

    async def notifySyncedGame(self, uid, game):
        if uid not in self.users:
            return
        
        if self.game is None and game in GAMES:
            self.game = GAMES[game]
        
        self.ready.add(uid)
        if len(self.ready) == self.max and self.gameObject is None:
            self.gameObject = self.game(self)
            await self.gameObject.start()
            await self.log({
                'event': 'start-game',
                'id': list(self.ready),
                'data': game
            })

    async def notifySyncedGameUpdate(self, uid, data):
        if uid not in self.users:
            return
        if self.gameObject is not None:
            await self.gameObject.update(uid, data)

    def terminateCurrentGame(self):
        self.ready = set()
        self.game = None
        self.gameObject = None

        
        


class RoomManager:
    def __init__(self):
        self.rooms = [ Room(0) ]
        self.nextid = 1

    async def add(self, connection, uid, name):
        user = User(connection, uid, name)
        self.rooms.sort(key=lambda room: len(room))

        for room in self.rooms:
            if not room.isfull():
                await room.add(user)
                return
        
        self.rooms.append(Room(self.nextid))
        self.nextid += 1
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

    async def notifySyncedGame(self, uid, game):
        for room in self.rooms:
            await room.notifySyncedGame(uid, game)

    async def notifySyncedGameUpdate(self, uid, data):
        for room in self.rooms:
            await room.notifySyncedGameUpdate(uid, data)


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
    