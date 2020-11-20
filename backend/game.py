class Game:

    def __init__(self, room, name=''):
        self.name = name
        self.room = room
        self.users = set()
        
    async def publish(self, message):
        for user in self.users:
            await user.send(message)

    async def start(self):
        # print('announcing start to room:', self.room)
        await self.room.announce({
            'message': 'start'
        })
        await self.setup()

    async def setup(self):
        pass

    async def update(self, uid, data):
        pass


from random import shuffle
class GetOthersToFollowGame (Game):
    def __init__(self, room):
        super().__init__(room, name='GetOthersToFollowGame')

    async def setup(self):
        userids = list(self.room.keys())
        shuffle(userids)
        self.elected = userids[0]
        self.others = userids[1:]

        await self.room[self.elected].send({
            'message': 'command',
            'command': 'elected',
            'data': self.room[self.others[0]].name
        })

        for user in self.others:
            await self.room[user].send({
                'message': 'command',
                'command': 'follow',
                'data': self.room[self.elected].name
            })
        
        print('elected people notified')

    async def update(self, uid, data):
        print(uid, data)
        if data == 'terminate':
            for user in self.others:
                await self.room[user].send({
                    'message': 'command',
                    'command': 'stopped',
                    'data': uid
                })
            self.room.terminateCurrentGame()


from random import random
class TouchDotGame (Game):
    def __init__(self, room):
        super().__init__(room, name='TouchDotGame')

    async def setup(self):
        self.target = [
            random() * 0.8 + 0.1,
            random() * 0.8 + 0.1,
        ]
        self.successes = 0
        self.touching = {}
        for user in self.room.users:
            self.touching[user] = False

        await self.room.announce({
            'message': 'command',
            'command': 'swirl-update',
            'data': self.target
        })

    async def checkTouching(self):
        touching = [ True for user in self.room.users if self.touching[user] ]
        if len(touching) == len(self.room.users):
            await self.updateSwirl()

    async def updateSwirl(self):
        self.target = [
            random() * 0.8 + 0.1,
            random() * 0.8 + 0.1,
        ]

        self.successes += 1

        if self.successes < 5:
            await self.room.announce({
                'message': 'command',
                'command': 'score',
                'data': self.successes
            })

            await self.room.announce({
                'message': 'command',
                'command': 'swirl-update',
                'data': self.target
            })
        else:
            await self.room.announce({
                'message': 'command',
                'command': 'success'
            })


    async def update(self, uid, data):
        if data == 'touching':
            self.touching[uid] = True
            await self.checkTouching()
        
        elif data == 'not-touching':
            self.touching[uid] = False
            await self.checkTouching()
        
        elif data == 'terminate':
            for user in self.others:
                await self.room[user].send({
                    'message': 'command',
                    'command': 'stopped',
                    'data': uid
                })
            self.room.terminateCurrentGame()