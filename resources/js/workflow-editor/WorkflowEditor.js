import { createEditor, ClassicPreset } from 'rete';
import { AreaPlugin, AreaExtensions } from 'rete-area-plugin';
import { ConnectionPlugin, Presets as ConnectionPresets } from 'rete-connection-plugin';
import { RenderPlugin, Presets as RenderPresets } from 'rete-render-utils';
import { StatusNode } from './nodes/StatusNode.js';
import { StatusSocket } from './sockets/StatusSocket.js';
import { PropertiesPanel } from './ui/PropertiesPanel.js';
import { ContextMenu } from './ui/ContextMenu.js';

export class WorkflowEditor {
    constructor(container) {
        this.container = container;
        this.editor = null;
        this.area = null;
        this.render = null;
        this.connection = null;
        this.socket = new StatusSocket();
        this.propertiesPanel = new PropertiesPanel();
        this.contextMenu = new ContextMenu();
        this.nodes = new Map();
        this.nodeIdCounter = 1;
    }

    async init() {
        try {
            // Create editor instance
            this.editor = await createEditor();

            // Setup area plugin (for positioning and visual management)
            this.area = new AreaPlugin(this.container);
            AreaExtensions.selectableNodes(this.area, AreaExtensions.selector(), {
                accumulating: AreaExtensions.accumulateOnCtrl()
            });

            // Setup connection plugin (for connecting nodes)
            this.connection = new ConnectionPlugin();
            this.connection.addPreset(ConnectionPresets.classic.setup());

            // Setup render plugin (for visual rendering)
            this.render = new RenderPlugin();
            this.render.addPreset(RenderPresets.classic.setup());

            // Use plugins
            await this.editor.use(this.area);
            await this.area.use(this.connection);
            await this.area.use(this.render);

            // Setup event listeners
            this.setupEventListeners();

            // Load initial data
            await this.loadWorkflowData();

            console.log('Workflow Editor initialized successfully');
        } catch (error) {
            console.error('Failed to initialize Workflow Editor:', error);
        }
    }

    setupEventListeners() {
        // Right-click context menu
        this.area.addPipe(context => {
            if (context.type === 'contextmenu') {
                context.data.event.preventDefault();
                this.showContextMenu(context.data.event);
            }
            return context;
        });

        // Node selection
        this.area.addPipe(context => {
            if (context.type === 'nodeselected') {
                this.onNodeSelected(context.data.id);
            }
            return context;
        });

        // Connection events
        this.area.addPipe(context => {
            if (context.type === 'connectioncreated') {
                this.onConnectionCreated(context.data);
            }
            return context;
        });

        // Setup toolbar buttons
        this.setupToolbarEvents();
    }

    setupToolbarEvents() {
        document.getElementById('save-workflow')?.addEventListener('click', () => {
            this.saveWorkflow();
        });

        document.getElementById('reset-workflow')?.addEventListener('click', () => {
            this.resetWorkflow();
        });
    }

    showContextMenu(event) {
        const rect = this.container.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        this.contextMenu.show(event.clientX, event.clientY, [
            {
                label: 'Add Status',
                action: () => this.addStatusNode(x, y)
            }
        ]);
    }

    async addStatusNode(x, y) {
        const nodeId = `status_${this.nodeIdCounter++}`;
        const statusData = {
            id: nodeId,
            name: `Status ${this.nodeIdCounter - 1}`,
            description: 'New status description',
            color_code: '#3B82F6',
            allowed_roles: ['admin']
        };

        const node = new StatusNode(nodeId, statusData, this.socket);
        await this.editor.addNode(node);
        await this.area.translate(node.id, { x, y });

        this.nodes.set(nodeId, { node, data: statusData });

        // Automatically open properties panel
        this.propertiesPanel.show(statusData, (updatedData) => {
            this.updateNodeData(nodeId, updatedData);
        });
    }

    onNodeSelected(nodeId) {
        const nodeData = this.nodes.get(nodeId);
        if (nodeData) {
            this.propertiesPanel.show(nodeData.data, (updatedData) => {
                this.updateNodeData(nodeId, updatedData);
            });
        }
    }

    updateNodeData(nodeId, newData) {
        const nodeData = this.nodes.get(nodeId);
        if (nodeData) {
            nodeData.data = { ...nodeData.data, ...newData };
            this.nodes.set(nodeId, nodeData);

            // Update visual representation
            this.updateNodeVisual(nodeId);
        }
    }

    updateNodeVisual(nodeId) {
        const nodeData = this.nodes.get(nodeId);
        if (nodeData) {
            // Update node appearance based on new data
            const nodeElement = this.container.querySelector(`[data-node-id="${nodeId}"]`);
            if (nodeElement) {
                // Update colors, text, etc.
                nodeElement.style.borderColor = nodeData.data.color_code;
                const titleElement = nodeElement.querySelector('.node-title');
                if (titleElement) {
                    titleElement.textContent = nodeData.data.name;
                }
            }
        }
    }

    onConnectionCreated(connection) {
        console.log('Connection created:', connection);
        // Store transition data
    }

    customizeNode(context) {
        const { payload } = context;
        const nodeData = this.nodes.get(payload.id);

        if (nodeData) {
            return {
                ...context,
                payload: {
                    ...payload,
                    data: nodeData.data
                }
            };
        }
        return context;
    }

    customizeConnection(context) {
        return {
            ...context,
            payload: {
                ...context.payload,
                className: 'workflow-connection'
            }
        };
    }

    loadWorkflowData() {
        // Get data from Livewire component
        const statusesData = this.container.dataset.statuses;
        const transitionsData = this.container.dataset.transitions;

        if (statusesData) {
            try {
                const statuses = JSON.parse(statusesData);
                this.loadStatuses(statuses);
            } catch (error) {
                console.error('Failed to parse statuses data:', error);
            }
        }
    }

    async loadStatuses(statuses) {
        for (const status of statuses) {
            const nodeId = `status_${status.id}`;
            const node = new StatusNode(nodeId, status, this.socket);

            await this.editor.addNode(node);
            await this.area.translate(node.id, {
                x: status.position_x || 100,
                y: status.position_y || 100
            });

            this.nodes.set(nodeId, { node, data: status });
        }
    }

    saveWorkflow() {
        const workflowData = {
            statuses: Array.from(this.nodes.values()).map(({ data }) => data),
            transitions: this.getTransitions()
        };

        // Send to Livewire component
        if (window.Livewire) {
            window.Livewire.emit('saveWorkflow', workflowData);
        }

        console.log('Saving workflow:', workflowData);
    }

    getTransitions() {
        const transitions = [];
        const connections = this.editor.getConnections();

        connections.forEach(connection => {
            transitions.push({
                from_status_id: connection.source,
                to_status_id: connection.target,
                condition_expression: null
            });
        });

        return transitions;
    }

    resetWorkflow() {
        if (confirm('Are you sure you want to reset the workflow? This will remove all nodes and connections.')) {
            this.editor.clear();
            this.nodes.clear();
            this.nodeIdCounter = 1;
        }
    }
}
