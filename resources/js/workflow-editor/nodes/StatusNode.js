import Rete from 'rete';

class TitleControl extends Rete.Control {
    constructor(emitter, key, node) {
        super(key);
        this.emitter = emitter;
        this.key = key;
        this.node = node;
        this.render = 'js';

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
        this.render = 'js';

        const el = document.createElement('div');
        el.style.fontSize = '0.9em';
        el.style.opacity = '0.8';
        el.textContent = node.data.description || '';
        this.element = el;
    }
}

export class StatusNode extends Rete.Component {
    constructor(name, socket) {
        super(name);
        this.socket = socket;
        this.data.component = name;
    }

    builder(node) {
        const input = new Rete.Input('input', 'Input', this.socket);
        const output = new Rete.Output('output', 'Output', this.socket);

        const titleControl = new TitleControl(this.editor, 'title', node);
        const descControl = new DescriptionControl(this.editor, 'description', node);

        return node
            .addInput(input)
            .addOutput(output)
            .addControl(titleControl)
            .addControl(descControl);
    }

    worker(node, inputs, outputs) {
        // No processing needed for this node type
    }

    async createNode(data = {}) {
        const node = await super.createNode(data);

        node.data = {
            ...node.data,
            ...data,
            style: {
                background: data.color_code || '#3B82F6',
                color: '#ffffff',
                'border-radius': '8px',
                padding: '12px',
                width: '180px'
            }
        };

        // Apply styles directly to the node element when it's created
        const applyStyles = () => {
            if (node.vueContext && node.vueContext.$el) {
                const el = node.vueContext.$el;
                Object.assign(el.style, node.data.style);
            } else {
                // If the element isn't ready yet, try again in a moment
                setTimeout(applyStyles, 50);
            }
        };

        // Start trying to apply styles
        applyStyles();

        return node;
    }
}
