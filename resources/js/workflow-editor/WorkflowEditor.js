import Rete from 'rete';
import AreaPlugin from 'rete-area-plugin';
import ConnectionPlugin from 'rete-connection-plugin';
import ContextMenuPlugin from 'rete-context-menu-plugin';
import { StatusNode } from './nodes/StatusNode.js';
import { StatusSocket } from './sockets/StatusSocket.js';
import { PropertiesPanel } from './ui/PropertiesPanel.js';

export class WorkflowEditor {
    constructor(container) {
        this.container = container;
        this.editor = null;
        this.socket = new StatusSocket();
        this.propertiesPanel = new PropertiesPanel();
        this.nodes = new Map();
        this.nodeIdCounter = 1;
        this.components = {};
    }

    async initialize() {
        try {
            // Create editor instance
            this.editor = new Rete.NodeEditor('workflow@1.0.0', this.container);

            // Register components
            this.components.status = new StatusNode('Status', this.socket);
            this.editor.register(this.components.status);

            // Initialize plugins
            this.editor.use(ConnectionPlugin);
            this.editor.use(AreaPlugin, {
                background: true,
                snap: false,
                scaleExtent: { min: 0.1, max: 1.5 }
            });

            // Initialize context menu
            this.editor.use(ContextMenuPlugin, {
                items: {
                    'Add Status': {
                        label: 'Add Status',
                        onClick: () => {
                            const mousePosition = this.editor.view.area.mouse;
                            this.addStatusNode(mousePosition.x, mousePosition.y);
                        }
                    }
                }
            });

            // Setup event listeners
            this.setupEventListeners();

            // Load initial data
            await this.loadWorkflowData();

            // Arrange nodes
            this.editor.view.resize();
            AreaPlugin.zoomAt(this.editor);

            // Process
            this.editor.on('process nodecreated noderemoved connectioncreated connectionremoved', async () => {
                await this.editor.process();
            });

            console.log('Workflow Editor initialized successfully');
        } catch (error) {
            console.error('Failed to initialize Workflow Editor:', error);
        }
    }

    setupEventListeners() {
        // Node selection
        this.editor.on('nodeselected', node => {
            const nodeData = this.nodes.get(node.id);
            if (nodeData) {
                this.propertiesPanel.show(nodeData.data, (updatedData) => {
                    this.updateNodeData(node.id, updatedData);
                });
            }
        });

        // Node removal
        this.editor.on('noderemoved', node => {
            this.nodes.delete(node.id);
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
            const node = await this.components.status.createNode(statusData);
            node.position = [x || 100, y || 100];

            // Add node to editor
            await this.editor.addNode(node);

            // Store node data
            this.nodes.set(nodeId, { node, data: statusData });

            // Show properties panel
            this.propertiesPanel.show(statusData, (updatedData) => {
                this.updateNodeData(nodeId, updatedData);
            });

            console.log('Status node added:', {
                id: nodeId,
                position: node.position,
                data: statusData
            });

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
            nodeData.node.data = newData;
            this.editor.trigger('process');
            this.nodes.set(nodeId, nodeData);
        }
    }

    async deleteNode(nodeId) {
        try {
            const node = this.editor.nodes.find(n => n.id === nodeId);
            if (node) {
                await this.editor.removeNode(node);
                this.nodes.delete(nodeId);
            }
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

                // Add connections if transitions exist
                if (transitionsData) {
                    const transitions = JSON.parse(transitionsData);
                    for (const transition of transitions) {
                        const fromNode = this.editor.nodes.find(n => n.id === transition.from_status_id);
                        const toNode = this.editor.nodes.find(n => n.id === transition.to_status_id);
                        if (fromNode && toNode) {
                            this.editor.connect(fromNode.outputs.get('output'), toNode.inputs.get('input'));
                        }
                    }
                }
            } catch (error) {
                console.error('Failed to parse workflow data:', error);
            }
        }
    }

    saveWorkflow() {
        const workflowData = {
            statuses: Array.from(this.nodes.values()).map(({ data, node }) => ({
                ...data,
                position_x: node.position[0],
                position_y: node.position[1]
            })),
            transitions: this.getTransitions()
        };

        // Send to Livewire component
        if (window.Livewire) {
            window.Livewire.emit('saveWorkflow', workflowData);
        }
    }

    getTransitions() {
        return this.editor.connections.map(conn => ({
            from_status_id: conn.output.node.id,
            to_status_id: conn.input.node.id
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
