import sys
import json
import asyncio
import pathlib

import ssl
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

            elif data['message'] == 'touch':
                await manager.publish(userid, data)

            elif data['message'] == 'game':
                await manager.notifySyncedGame(data['id'], data['data'])

            elif data['message'] == 'game-update':
                await manager.notifySyncedGameUpdate(data['id'], data['data'])

    finally:
        await manager.remove(userid)
        return

print('Server running at port 8765...')
if len(sys.argv) > 1 and sys.argv[1] == 'dev':
    start_server = websockets.serve(hello, "0.0.0.0", 8765)
else:
    ssl_context = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
    ssl_context.load_cert_chain("/etc/nginx/shengchen.design.pem")
    start_server = websockets.serve(hello, "0.0.0.0", 8765, ssl=ssl_context)

asyncio.get_event_loop().run_until_complete(start_server)
asyncio.get_event_loop().run_forever()