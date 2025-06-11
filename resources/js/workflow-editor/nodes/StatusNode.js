import { ClassicPreset } from 'rete';

export class StatusNode extends ClassicPreset.Node {
    constructor(id, data, socket) {
        super(data.name);

        this.id = id;
        this.data = data;

        // Set dimensions
        this.width = 180;
        this.height = 100;

        // Add input and output sockets
        this.addInput('input', new ClassicPreset.Input(socket));
        this.addOutput('output', new ClassicPreset.Output(socket));

        // Set display properties
        this.label = data.name;
        this.displayStyle = {
            backgroundColor: data.color_code || '#3B82F6',
            color: '#ffffff',
            borderRadius: '8px',
            padding: '12px'
        };

        // Store additional data
        this.meta = {
            statusId: data.id,
            description: data.description,
            colorCode: data.color_code,
            allowedRoles: data.allowed_roles
        };
    }
}