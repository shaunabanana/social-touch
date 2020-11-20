import socketserver

class MyTCPHandler(socketserver.BaseRequestHandler):

    def handle(self):
        # self.request is the TCP socket connected to the client
        self.data = self.request.recv(4096).strip()
        print(self.data)
        with open('test.log', 'a') as f:
            f.write(self.data.decode('utf-8'))


class MyTCPServer(socketserver.TCPServer):

    def server_close(self):
        self.shutdown()
        return socketserver.TCPServer.server_close(self)

if __name__ == "__main__":
    HOST, PORT = "127.0.0.1", 8888

    # Create the server, binding to localhost on port 9999
    with MyTCPServer((HOST, PORT), MyTCPHandler) as server:
        # Activate the server; this will keep running until you
        # interrupt the program with Ctrl-C
        try:
            server.serve_forever()
        except KeyboardInterrupt:
            server.shutdown()
            