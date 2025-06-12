import 'regenerator-runtime/runtime';
import Rete from 'rete';
import AreaPlugin from 'rete-area-plugin';
import ConnectionPlugin from 'rete-connection-plugin';
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

        // Add CSS to container
        container.style.position = 'relative';
        container.style.overflow = 'hidden';
    }

    async initialize() {
        try {
            // Create editor instance
            this.editor = new Rete.NodeEditor('workflow@1.0.0', this.container);

            // Initialize area plugin first
            this.editor.use(AreaPlugin, {
                background: true,
                snap: false,
                scaleExtent: { min: 0.1, max: 1.5 },
                translateExtent: { width: 5000, height: 4000 }
            });

            // Then initialize connection plugin
            this.editor.use(ConnectionPlugin);

            // Register components
            this.components.status = new StatusNode('Status', this.socket);
            await this.editor.register(this.components.status);

            // Initialize custom context menu
            this.setupContextMenu();

            // Setup event listeners
            this.setupEventListeners();

            // Load initial data
            await this.loadWorkflowData();

            // Arrange nodes
            this.editor.view.resize();
            AreaPlugin.zoomAt(this.editor);

            // Setup process handling
            this.editor.on(['process', 'nodecreated', 'noderemoved', 'connectioncreated', 'connectionremoved'], async () => {
                await this.processNodes();
            });

            console.log('Workflow Editor initialized successfully');
        } catch (error) {
            console.error('Failed to initialize Workflow Editor:', error);
            throw error;
        }
    }

    setupContextMenu() {
        // Create context menu element
        const contextMenu = document.createElement('div');
        contextMenu.className = 'context-menu hidden';
        contextMenu.innerHTML = `
            <button data-action="add-status">Add Status</button>
        `;
        document.body.appendChild(contextMenu);

        // Handle context menu positioning and display
        this.container.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            e.stopPropagation();

            // Get the editor's viewport position and zoom level
            const view = this.editor.view;
            const transform = view.area.transform;
            const zoom = transform.k;

            // Convert mouse position to editor coordinates
            const rect = this.container.getBoundingClientRect();
            const x = (e.clientX - rect.left) / zoom - transform.x;
            const y = (e.clientY - rect.top) / zoom - transform.y;

            // Position the context menu at the mouse position
            contextMenu.style.left = `${e.clientX}px`;
            contextMenu.style.top = `${e.clientY}px`;
            contextMenu.classList.remove('hidden');

            // Store the converted coordinates for node creation
            contextMenu.dataset.x = x;
            contextMenu.dataset.y = y;
        });

        // Handle menu item clicks
        contextMenu.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();

            const action = e.target.dataset.action;
            if (action === 'add-status') {
                const x = parseFloat(contextMenu.dataset.x);
                const y = parseFloat(contextMenu.dataset.y);
                this.addStatusNode(x, y);
            }
            contextMenu.classList.add('hidden');
        });

        // Hide menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!contextMenu.contains(e.target)) {
                contextMenu.classList.add('hidden');
            }
        });

        // Hide menu when scrolling or dragging
        this.container.addEventListener('wheel', () => {
            contextMenu.classList.add('hidden');
        });

        this.container.addEventListener('mousemove', (e) => {
            if (e.buttons > 0) { // If any mouse button is pressed
                contextMenu.classList.add('hidden');
            }
        });
    }

    async processNodes() {
        // This is where you would implement any processing logic
        // For now, we'll just validate the connections
        for (const node of this.editor.nodes) {
            const nodeComponent = this.components[node.name.toLowerCase()];
            if (nodeComponent && nodeComponent.worker) {
                await nodeComponent.worker(node, {}, {});
            }
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

            // Force editor to update
            this.editor.view.resize();
            this.editor.trigger('process');

            console.log('Status node added:', {
                id: nodeId,
                position: node.position,
                data: statusData
            });

        } catch (error) {
            console.error('Failed to add status node:', error);
            throw error;
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
            this.processNodes().catch(console.error);
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
                // First create all nodes
                for (const status of statuses) {
                    await this.addStatusNode(status.position_x || 100, status.position_y || 100);
                }

                // Then create connections if transitions exist
                if (transitionsData) {
                    const transitions = JSON.parse(transitionsData);
                    for (const transition of transitions) {
                        try {
                            const fromNode = this.editor.nodes.find(n => n.id === transition.from_status_id);
                            const toNode = this.editor.nodes.find(n => n.id === transition.to_status_id);

                            if (fromNode && toNode) {
                                const output = fromNode.outputs.get('output');
                                const input = toNode.inputs.get('input');

                                if (output && input) {
                                    await this.editor.connect(output, input);
                                } else {
                                    console.warn('Could not find input/output for connection:', {
                                        fromNode: fromNode.id,
                                        toNode: toNode.id
                                    });
                                }
                            } else {
                                console.warn('Could not find nodes for connection:', transition);
                            }
                        } catch (error) {
                            console.error('Failed to create connection:', error);
                        }
                    }
                }

                await this.processNodes();
            } catch (error) {
                console.error('Failed to parse workflow data:', error);
            }
        }
    }

    getTransitions() {
        const connections = Array.from(this.editor.view.connections.values());
        return connections.map(conn => ({
            from_status_id: conn.output.node.id,
            to_status_id: conn.input.node.id
        }));
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

    resetWorkflow() {
        if (confirm('Are you sure you want to reset the workflow? This will remove all nodes and connections.')) {
            this.editor.clear();
            this.nodes.clear();
            this.nodeIdCounter = 1;
        }
    }
}
