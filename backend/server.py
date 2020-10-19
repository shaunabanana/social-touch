import json
import asyncio
import websockets

from room import Room, RoomManager

manager = RoomManager()

async def hello(websocket, path):
    userid = ''
    username = ''

    try:
        while True:
            text = await websocket.recv()
            data = json.loads(text)
            
            if data['message'] == 'join':
                userid = data['id']
                username = data['name']
                await manager.add(websocket, data['id'], data['name'])
                print(f'{username}({userid}) joined.')

            elif data['message'] == 'touch':
                # print(f'{username}({userid}) is touching screen.')
                await manager.publish(userid, data)

            elif data['message'] == 'game':
                if data['data'] == 'TouchDotGame':
                    await manager.notifyCollaborativeGame(data['id'], data['data'])
                # await manager.publish(userid, data)

            elif data['message'] == 'score':
                await manager.notifyCollaborativeGameScored(data['id'])

    finally:
        await manager.remove(userid)
        print(f'{username}({userid}) left. Closing connection.')
        return

print('Server running at port 8765...')
start_server = websockets.serve(hello, "0.0.0.0", 8765)

asyncio.get_event_loop().run_until_complete(start_server)
asyncio.get_event_loop().run_forever()