import { ClassicPreset } from 'rete';

export class StatusNode extends ClassicPreset.Node {
    constructor(id, data, socket) {
        super(data.name || 'Status');

        this.data = data;
        this.width = 200;
        this.height = 120;

        // Add input and output for connections
        this.addInput('input', new ClassicPreset.Input(socket, 'Input'));
        this.addOutput('output', new ClassicPreset.Output(socket, 'Output'));

        // Store additional data
        this.meta = {
            statusId: data.id,
            description: data.description,
            colorCode: data.color_code,
            allowedRoles: data.allowed_roles
        };
    }
}