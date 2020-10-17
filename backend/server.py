import json
import asyncio
import websockets

from room import Room, RoomManager

manager = RoomManager()

async def hello(websocket, path):
    connections.add(websocket)
    userid = ''
    username = ''

    try:
        while True:
            text = await websocket.recv()
            data = json.loads(text)
            
            if data['message'] == 'join':
                userid = data['id']
                username = data['name']
                manager.add(websocket, data['id'], data['name'])

            elif data['message'] == 'touch':
                pass

    finally:
        connections.remove(websocket)

print('Server running at port 8765...')
start_server = websockets.serve(hello, "0.0.0.0", 8765)

asyncio.get_event_loop().run_until_complete(start_server)
asyncio.get_event_loop().run_forever()