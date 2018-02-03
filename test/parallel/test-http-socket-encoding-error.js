'use strict';

const common = require( '../common' );
const http = require('http');

const server = http.createServer().listen(0, connectToServer);

server.on('connection', socket => {
  common.expectsError(() => socket.setEncoding(''),
                      {
                        code: 'ERR_METHOD_NOT_IMPLEMENTED',
                        type: Error
                      });

  socket.end();
});

function connectToServer() {
  const client = new http.Agent().createConnection(this.address().port, () => {
    client.end();
  })
    .on('end', () => server.close());
}
