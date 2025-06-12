import Rete from 'rete';

export class StatusSocket extends Rete.Socket {
    constructor() {
        super('status');
        this.name = 'Status';
    }

    compatibleWith(socket) {
        return this.name === socket.name;
    }
}
