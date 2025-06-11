import { NodeEditor, ClassicPreset } from 'rete';
import { AreaPlugin, AreaExtensions } from 'rete-area-plugin';
import { ConnectionPlugin } from 'rete-connection-plugin';
import { StatusNode } from './nodes/StatusNode.js';
import { StatusSocket } from './sockets/StatusSocket.js';
import { PropertiesPanel } from './ui/PropertiesPanel.js';
import { ContextMenu } from './ui/ContextMenu.js';

// Define the types for our editor
const socket = new ClassicPreset.Socket('socket');

// Define the connection and node types
class Connection extends ClassicPreset.Connection {
}

class Node extends ClassicPreset.Node {
    constructor(socket) {
        super('Status');
        this.addOutput('output', new ClassicPreset.Output(socket));
        this.addInput('input', new ClassicPreset.Input(socket));
    }
}

export class WorkflowEditor {
    constructor(container) {
        this.container = container;
        this.editor = null;
        this.area = null;
        this.connection = null;
        this.socket = new StatusSocket();
        this.propertiesPanel = new PropertiesPanel();
        this.contextMenu = new ContextMenu();
        this.nodes = new Map();
        this.nodeIdCounter = 1;
    }

    async initialize() {
        try {
            // Create editor instance
            this.editor = new NodeEditor();

            // Setup area plugin
            this.area = new AreaPlugin(this.container);

            // Add classic preset for area extensions
            AreaExtensions.selectableNodes(this.area, AreaExtensions.selector(), {
                accumulating: AreaExtensions.accumulateOnCtrl()
            });

            // Setup connection plugin
            this.connection = new ConnectionPlugin();

            // Add connection preset
            this.connection.addPreset(() => ({
                createConnection: () => new ClassicPreset.Connection(),
                validate: ({ input, output }) => input.socket === output.socket
            }));

            // Use plugins in correct order
            await this.editor.use(this.area);
            await this.area.use(this.connection);

            // Setup event listeners
            this.setupEventListeners();

            // Load initial data
            await this.loadWorkflowData();

            console.log('Workflow Editor initialized successfully');
        } catch (error) {
            console.error('Failed to initialize Workflow Editor:', error);
            throw error;
        }
    }

    setupEventListeners() {
        // Right-click context menu
        this.area.addPipe(context => {
            if (context.type === 'contextmenu') {
                const event = context.data.event;
                event.preventDefault();
                event.stopPropagation();

                // Get position relative to the editor
                const rect = this.container.getBoundingClientRect();
                const x = event.clientX - rect.left;
                const y = event.clientY - rect.top;

                // Convert screen coordinates to editor coordinates
                const { k: zoom, x: panX, y: panY } = this.area.area.transform;
                const editorX = (x - panX) / zoom;
                const editorY = (y - panY) / zoom;

                // Show context menu
                this.contextMenu.show(event.clientX, event.clientY, [
                    {
                        label: '+ Add Status',
                        icon: '📝',
                        action: () => this.addStatusNode(editorX, editorY)
                    }
                ]);
            }
            return context;
        });

        // Node selection
        this.area.addPipe(context => {
            if (context.type === 'nodepicked') {
                const nodeData = this.nodes.get(context.data.id);
                if (nodeData) {
                    this.propertiesPanel.show(nodeData.data, (updatedData) => {
                        this.updateNodeData(context.data.id, updatedData);
                    });
                }
            }
            return context;
        });

        // Setup toolbar buttons
        this.setupToolbarEvents();
    }

    setupToolbarEvents() {
        const saveButton = document.getElementById('save-workflow');
        if (saveButton) {
            saveButton.addEventListener('click', () => this.saveWorkflow());
        }

        const resetButton = document.getElementById('reset-workflow');
        if (resetButton) {
            resetButton.addEventListener('click', () => this.resetWorkflow());
        }
    }

    async addStatusNode(x, y) {
        try {
            const nodeId = `status_${this.nodeIdCounter++}`;
            const statusData = {
                id: nodeId,
                name: `Status ${this.nodeIdCounter - 1}`,
                description: 'New status description',
                color_code: '#3B82F6',
                allowed_roles: ['admin']
            };

            // Create new node
            const node = new StatusNode(nodeId, statusData, this.socket);

            // Add node to editor
            await this.editor.addNode(node);

            // Position the node
            await this.area.translate(node.id, { x, y });

            // Store node data
            this.nodes.set(nodeId, { node, data: statusData });

            // Show properties panel
            this.propertiesPanel.show(statusData, (updatedData) => {
                this.updateNodeData(nodeId, updatedData);
            });

            console.log('Status node added:', nodeId);
        } catch (error) {
            console.error('Failed to add status node:', error);
        }
    }

    updateNodeData(nodeId, newData) {
        if (newData._delete) {
            this.deleteNode(nodeId);
            return;
        }

        const nodeData = this.nodes.get(nodeId);
        if (nodeData) {
            nodeData.data = { ...nodeData.data, ...newData };
            nodeData.node.label = newData.name;
            this.nodes.set(nodeId, nodeData);
            this.area.update('node', nodeId);
        }
    }

    async deleteNode(nodeId) {
        try {
            await this.editor.removeNode(nodeId);
            this.nodes.delete(nodeId);
        } catch (error) {
            console.error('Failed to delete node:', error);
        }
    }

    async loadWorkflowData() {
        const statusesData = this.container.dataset.statuses;
        const transitionsData = this.container.dataset.transitions;

        if (statusesData) {
            try {
                const statuses = JSON.parse(statusesData);
                for (const status of statuses) {
                    await this.addStatusNode(status.position_x || 100, status.position_y || 100);
                }
            } catch (error) {
                console.error('Failed to parse statuses data:', error);
            }
        }
    }

    saveWorkflow() {
        const workflowData = {
            statuses: Array.from(this.nodes.values()).map(({ data }) => ({
                ...data,
                position: this.area.nodeViews.get(data.id)?.position
            })),
            transitions: this.getTransitions()
        };

        // Send to Livewire component
        if (window.Livewire) {
            window.Livewire.emit('saveWorkflow', workflowData);
        }
    }

    getTransitions() {
        return Array.from(this.editor.getConnections()).map(conn => ({
            from_status_id: conn.source,
            to_status_id: conn.target
        }));
    }

    resetWorkflow() {
        if (confirm('Are you sure you want to reset the workflow? This will remove all nodes and connections.')) {
            this.editor.clear();
            this.nodes.clear();
            this.nodeIdCounter = 1;
        }
    }
}
