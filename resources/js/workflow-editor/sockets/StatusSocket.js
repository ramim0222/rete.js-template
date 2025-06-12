import Rete from 'rete';

export class StatusSocket extends Rete.Socket {
    constructor() {
        super('Status');
    }

    // Allow connections between status sockets
    compatibleWith(socket) {
        return socket instanceof StatusSocket;
    }
}
