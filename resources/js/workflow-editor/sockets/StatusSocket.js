import { ClassicPreset } from 'rete';

export class StatusSocket extends ClassicPreset.Socket {
    constructor() {
        super('status');
        this.name = 'status';
    }
}
