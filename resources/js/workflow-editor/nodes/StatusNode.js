import { ClassicPreset } from 'rete';

export class StatusNode extends ClassicPreset.Node {
    constructor(id, data, socket) {
        super(id);

        this.data = data;
        this.width = 200;
        this.height = 100;

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

        // Set display properties
        this.displayName = data.name || 'Status';
        this.backgroundColor = data.color_code || '#3B82F6';
    }

    // This method is called by the render plugin to get data for rendering
    data() {
        return {
            label: this.displayName,
            description: this.meta.description,
            color: this.backgroundColor,
            roles: this.meta.allowedRoles.join(', ')
        };
    }

    // Custom render method for status nodes
    render() {
        return {
            template: this.getTemplate(),
            style: this.getStyle()
        };
    }

    getTemplate() {
        return `
            <div class="status-node" data-node-id="${this.id}">
                <div class="node-header" style="background-color: ${this.data.color_code}">
                    <div class="node-title">${this.data.name}</div>
                </div>
                <div class="node-body">
                    <div class="node-description">${this.data.description || ''}</div>
                    <div class="node-roles">
                        ${this.data.allowed_roles ? this.data.allowed_roles.join(', ') : 'No roles'}
                    </div>
                </div>
            </div>
        `;
    }

    getStyle() {
        return {
            borderColor: this.data.color_code,
            borderWidth: '2px',
            borderStyle: 'solid',
            borderRadius: '8px',
            backgroundColor: 'white',
            minWidth: '200px'
        };
    }
}
