import Rete from 'rete';

export class StatusNode extends Rete.Component {
    constructor(name, socket) {
        super(name);
        this.socket = socket;
        this.data.component = name;
    }

    builder(node) {
        const input = new Rete.Input('input', 'Input', this.socket, true);
        const output = new Rete.Output('output', 'Output', this.socket, true);

        node.addInput(input)
            .addOutput(output);

        // Add custom styling
        node.data.style = {
            background: node.data.color_code || '#3B82F6',
            color: '#ffffff',
            'border-radius': '8px',
            padding: '12px'
        };

        // Create node elements
        const titleEl = document.createElement('div');
        titleEl.textContent = node.data.name || 'Status';
        titleEl.style.fontWeight = 'bold';
        titleEl.style.marginBottom = '8px';

        const descEl = document.createElement('div');
        descEl.textContent = node.data.description || '';
        descEl.style.fontSize = '0.9em';
        descEl.style.opacity = '0.8';

        node.update = () => {
            titleEl.textContent = node.data.name || 'Status';
            descEl.textContent = node.data.description || '';
            node.data.style.background = node.data.color_code || '#3B82F6';
        };

        return node
            .addControl(new Rete.Control('title', { element: titleEl }))
            .addControl(new Rete.Control('description', { element: descEl }));
    }

    async createNode(data) {
        const node = await this.createNode();
        node.data = {
            ...node.data,
            ...data,
            style: {
                background: data.color_code || '#3B82F6',
                color: '#ffffff',
                'border-radius': '8px',
                padding: '12px'
            }
        };
        return node;
    }

    worker(node, inputs, outputs) {
        // No processing needed for this node type
    }
}
