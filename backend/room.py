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



class Room:
    def __init__(self, maxusers=4):
        self.users = {}
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

    def add(self, user):
        if self.isfull():
            return
        self.users[user.id] = user

    def remove(self, uid):
        del self.users[uid]
        


class RoomManager:
    def __init__(self):
        self.rooms = [ Room() ]

    def add(self, connection, uid, name):
        user = User(connection, uid, name)
        room_to_join = None
        for room in self.rooms:
            if not room.isfull():
                room.add(user)
                return
        self.rooms.append(Room())
        self.rooms[-1].add(user)

    def remove(self, uid):
        for room in self.rooms:
            try:
                room.remove(uid)
            except KeyError:
                pass
        self.rooms = [room for room in self.rooms if not room.isempty()]



if __name__ == '__main__':
    manager = RoomManager()
    for i in range(10):
        manager.add(None, str(i), 'User')
        print(manager.rooms)

        if i == 7:
            manager.remove('3')
            manager.remove('1')
            manager.remove('2')
            manager.remove('0')
            manager.remove('5')
    