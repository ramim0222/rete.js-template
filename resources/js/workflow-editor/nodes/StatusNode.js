import Rete from 'rete';

class TitleControl extends Rete.Control {
    constructor(emitter, key, node) {
        super(key);
        this.emitter = emitter;
        this.key = key;
        this.node = node;

        const el = document.createElement('div');
        el.style.fontWeight = 'bold';
        el.style.marginBottom = '8px';
        el.textContent = node.data.name || 'Status';
        this.element = el;
    }
}

class DescriptionControl extends Rete.Control {
    constructor(emitter, key, node) {
        super(key);
        this.emitter = emitter;
        this.key = key;
        this.node = node;

        const el = document.createElement('div');
        el.style.fontSize = '0.9em';
        el.style.opacity = '0.8';
        el.textContent = node.data.description || '';
        this.element = el;
    }
}

export class StatusNode extends Rete.Component {
    constructor(name, socket) {
        super('Status');
        this.socket = socket;
        this.data.component = 'Status';
    }

    builder(node) {
        const input = new Rete.Input('input', 'Input', this.socket);
        const output = new Rete.Output('output', 'Output', this.socket);

        node
            .addInput(input)
            .addOutput(output);

        const titleControl = new TitleControl(this.editor, 'title', node);
        const descControl = new DescriptionControl(this.editor, 'description', node);

        return node
            .addControl(titleControl)
            .addControl(descControl);
    }

    async createNode(data = {}) {
        const node = new Rete.Node('Status');
        node.data = {
            ...data,
            component: 'Status',
            style: {
                background: data.color_code || '#3B82F6',
                color: '#ffffff',
                'border-radius': '8px',
                padding: '12px'
            }
        };

        await this.build(node);
        return node;
    }

    worker(node, inputs, outputs) {
        // No processing needed for this node type
    }
}
