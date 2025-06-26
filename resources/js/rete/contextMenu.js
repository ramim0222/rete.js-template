import { Node } from './Node';
import { openDrawer } from './drawer';
import { applyNodeColor } from './nodeStyles';
import { serializeNodesForSave, downloadAsFile } from './serialization';

export function createContextMenuConfig(editor, area) {
    return {
        items(context, plugin) {
            if (context === 'root') {
                return {
                    searchBar: false,
                    list: [
                        {
                            label: 'New Status',
                            key: 'new-status',
                            handler: async () => {
                                openDrawer(async (data) => {
                                    if (!data || !data.name) return;

                                    const node = new Node(
                                        data.name,
                                        data.color || "#aabbcc",
                                        data.description || "",
                                        data.condition || "equals"
                                    );

                                    // Calculate the center of the container
                                    const containerRect = area.container.getBoundingClientRect();
                                    const centerX = containerRect.width / 2;
                                    const centerY = containerRect.height / 2;

                                    // Position the node in the center
                                    node.position = [centerX - 100, centerY - 120];

                                    // Add the node to the editor
                                    await editor.addNode(node);

                                    // Multiple attempts to ensure styling is applied
                                    const applyNewNodeStyling = () => {
                                        // First, try to find and set the data-node-id
                                        const nodeElements = document.querySelectorAll('[data-testid="node"]');
                                        let targetElement = null;

                                        // Find the node element that doesn't have a data-node-id yet
                                        for (let i = nodeElements.length - 1; i >= 0; i--) {
                                            const el = nodeElements[i];
                                            if (!el.dataset.nodeId) {
                                                el.dataset.nodeId = node.id;
                                                targetElement = el;
                                                break;
                                            }
                                        }

                                        if (targetElement) {
                                            applyNodeColor(node);
                                        }

                                        // Apply all global styling functions
                                        if (window.applyNodeColors) window.applyNodeColors();
                                        if (window.nodeStyle) window.nodeStyle();
                                        if (window.handlePorts) window.handlePorts();
                                    };

                                    // Apply styling with multiple timing attempts
                                    setTimeout(applyNewNodeStyling, 50);
                                    setTimeout(applyNewNodeStyling, 150);
                                    setTimeout(applyNewNodeStyling, 300);

                                    // Emit to Livewire after successful styling
                                    if (window.Livewire?.emit) {
                                        Livewire.emit("saveTransactionNode", {
                                            name: data.name,
                                            color: data.color,
                                            description: data.description,
                                            condition: data.condition,
                                            x: node.position[0],
                                            y: node.position[1],
                                            id: node.id,
                                        });
                                    }
                                }, false);
                            }
                        }
                    ]
                };
            }
            if (context instanceof Node) {
                return {
                    searchBar: false,
                    list: [
                        {
                            label: 'Delete',
                            key: 'delete',
                            handler: async () => {
                                try {
                                    const nodeIdentifier = context.id;
                                    const connections = editor.getConnections();

                                    // Remove all connections associated with this node
                                    for (const connection of connections) {
                                        if (connection.source === context.id || connection.target === context.id) {
                                            await editor.removeConnection(connection.id);
                                        }
                                    }

                                    // Remove the node
                                    await editor.removeNode(context.id);

                                    // Update nodeOrder by removing the deleted node
                                    if (window.nodeOrder) {
                                        window.nodeOrder = window.nodeOrder.filter(id => id !== nodeIdentifier);
                                    }

                                    // Emit delete event to Livewire if available
                                    if (window.Livewire?.emit) {
                                        Livewire.emit("deleteTransactionNode", {
                                            id: context.id
                                        });
                                    }

                                    // Update the area and trigger port management
                                    area.update('node');

                                    // Trigger port management after deletion
                                    setTimeout(() => {
                                        if (window.handlePorts) {
                                            window.handlePorts();
                                        }
                                    }, 100);

                                } catch (error) {
                                    console.error('Error deleting node:', error);
                                }
                            }
                        },
                        {
                            label: 'Edit',
                            key: 'edit',
                            handler: async () => {
                                // Pre-populate the form with current values
                                document.getElementById('nodeName').value = context.controls.name.value;
                                document.getElementById('nodeColor').value = context.controls.color.value;
                                document.getElementById('nodeDesc').value = context.controls.description.value;
                                document.getElementById('nodeCondition').value = context.controls.condition.value;

                                // Open drawer in edit mode
                                openDrawer(async ({ name, color, description, condition }) => {
                                    if (!name) return;

                                    // Update the control values
                                    if (context.controls.name) {
                                        context.controls.name.value = name;
                                        context.controls.name.update?.();
                                    }

                                    if (context.controls.color) {
                                        context.controls.color.value = color || "#aabbcc";
                                        context.controls.color.update?.();
                                    }

                                    if (context.controls.description) {
                                        context.controls.description.value = description || "";
                                        context.controls.description.update?.();
                                    }

                                    if (context.controls.condition) {
                                        context.controls.condition.value = condition || "";
                                        context.controls.condition.update?.();
                                    }

                                    // Update the node's label for React rendering
                                    context.label = name;

                                    // Force area update to re-render the React component
                                    await area.update('node', context.id);

                                    // Apply styling with a delay to ensure React has re-rendered
                                    setTimeout(() => {
                                        if (window.applyNodeColors) window.applyNodeColors();
                                        if (window.nodeStyle) window.nodeStyle();
                                        applyNodeColor(context);
                                    }, 100);

                                    // Emit the update event to Livewire
                                    if (window.Livewire?.emit) {
                                        Livewire.emit("saveTransactionNode", {
                                            name,
                                            color,
                                            description,
                                            condition,
                                            x: context.position[0],
                                            y: context.position[1],
                                            id: context.id,
                                        });
                                    }
                                }, true);
                            }
                        }
                    ]
                };
            }
            return {
                searchBar: false,
                list: []
            };
        }
    };
}
