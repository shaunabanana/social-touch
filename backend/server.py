import asyncio
import websockets

peers = set()

async def hello(websocket, path):
    name = await websocket.recv()
    print(f"< {name}")

    greeting = f"Hello {name}! There are {len(peers)} people on the server."

    await websocket.send(greeting)
    print(f"> {greeting}")

start_server = websockets.serve(hello, "0.0.0.0", 8765)

asyncio.get_event_loop().run_until_complete(start_server)
asyncio.get_event_loop().run_forever()