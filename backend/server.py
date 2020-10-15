import json
import asyncio
import websockets

connections = set()

async def hello(websocket, path):
    connections.add(websocket)

    try:
        while True:
            data = await websocket.recv()
            print(data)

            peers = connections.difference(set([websocket]))
            for peer in peers:
                await peer.send(data)

    finally:
        connections.remove(websocket)

print('Server running at port 8765...')
start_server = websockets.serve(hello, "0.0.0.0", 8765)

asyncio.get_event_loop().run_until_complete(start_server)
asyncio.get_event_loop().run_forever()