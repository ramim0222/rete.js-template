import { NodeEditor, ClassicPreset } from "rete";
import { AreaPlugin, AreaExtensions } from "rete-area-plugin";
import { ConnectionPlugin, Presets as ConnectionPresets } from "rete-connection-plugin";
import { ReactPlugin, Presets as ReactPresets } from "rete-react-plugin";
import { AutoArrangePlugin, Presets as ArrangePresets, ArrangeAppliers } from "rete-auto-arrange-plugin";
import { ContextMenuPlugin, Presets as ContextMenuPresets } from "rete-context-menu-plugin";
import { easeInOut } from "popmotion";
import { insertableNodes } from "./insert-node/index";
import { createRoot } from 'react-dom/client';

const socket = new ClassicPreset.Socket("socket");

let drawerCallback = null;

function openDrawer(callback, editing = false) {
    if (window.openDrawer) {
        // Use the global openDrawer function if available
        window.openDrawer(callback, editing);
    } else {
        // Fallback to basic functionality
        drawerCallback = callback;
        document.getElementById("nodeDrawer").style.right = "0";
    }
}

export function submitDrawerForm(data) {
    if (drawerCallback) {
        drawerCallback(data);
        drawerCallback = null;
    }
    document.getElementById("nodeDrawer").style.right = "-100%";
}

class Node extends ClassicPreset.Node {
    constructor(name = "Status Name", color = "#aabbcc", description = "", condition = "equals") {
        super(String(name || "Status Name"));
        this.style = { backgroundColor: color, color: 'white' };
        this.width = 'auto';
        this.height = 'auto';
        this.label = String(name || "Status Name");

        this.addInput("port", new ClassicPreset.Input(socket));
        this.addOutput("port", new ClassicPreset.Output(socket));

        this.addControl("name", new ClassicPreset.InputControl("text", { initial: String(name || "Status Name") }));
        this.addControl("color", new ClassicPreset.InputControl("text", { initial: color }));
        this.addControl("description", new ClassicPreset.InputControl("text", { initial: description }));
        this.addControl("condition", new ClassicPreset.InputControl("text", { initial: condition }));
    }

    data() {
        return {
            name: String(this.controls.name.value || "Status Name"),
            color: this.controls.color.value,
            description: this.controls.description.value,
            condition: this.controls.condition.value
        };
    }
}

class Connection extends ClassicPreset.Connection {}

function applyNodeColor(node) {
    // Add a small delay to ensure DOM is ready
    setTimeout(() => {
        const el = document.querySelector(`[data-node-id="${node.id}"]`);
        if (el && node.controls?.color?.value) {
            // Apply background color
            el.style.background = node.controls.color.value;

            // Update title
            const titleEl = el.querySelector('[data-testid="title"]');
            if (titleEl) {
                titleEl.textContent = node.controls.name.value;
            }

            // Update description
            const descEl = el.querySelector('[data-testid="control-description"] p');
            if (descEl) {
                descEl.textContent = node.controls.description.value || '';
            }

            // Update condition
            const condEl = el.querySelector('[data-testid="control-condition"] p');
            if (condEl) {
                const conditionMap = {
                    'equals': 'Equals',
                    'not_equals': 'Not Equals',
                    'greater_than': 'Greater Than',
                    'less_than': 'Less Than'
                };
                const conditionValue = node.controls.condition.value;
                condEl.textContent = `Condition: ${conditionMap[conditionValue] || conditionValue}`;
            }

            // Force a re-render of the node style
            if (window.nodeStyle) {
                window.nodeStyle();
            }
        }
    }, 50); // Small delay to ensure DOM updates are complete
}

export async function createEditor(container) {
    const editor = new NodeEditor();
    const area = new AreaPlugin(container);
    const connection = new ConnectionPlugin();
    const render = new ReactPlugin({ createRoot });
    const arrange = new AutoArrangePlugin();
    const contextMenu = new ContextMenuPlugin({
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
                                    const containerRect = container.getBoundingClientRect();
                                    const centerX = containerRect.width / 2;
                                    const centerY = containerRect.height / 2;

                                    // Position the node in the center
                                    node.position = [centerX - 100, centerY - 120];

                                    await editor.addNode(node);

                                    // Wait until node is fully rendered before using its id
                                    render.addPipe((ctx) => {
                                        if (ctx.type === "rendered" && ctx.data.type === "node" && ctx.data.payload === node) {
                                            applyNodeColor(node);

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
                                        }
                                        return ctx;
                                    });
                                }, false); // Pass false to indicate we're creating
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
                                    // Get all connections
                                    const connections = editor.getConnections();
                                    
                                    // Remove all connections associated with this node
                                    for (const connection of connections) {
                                        if (connection.source === context.id || connection.target === context.id) {
                                            await editor.removeConnection(connection.id);
                                        }
                                    }
                                    
                                    // Remove the node
                                    await editor.removeNode(context.id);

                                    // Emit delete event to Livewire if available
                                    if (window.Livewire?.emit) {
                                        Livewire.emit("deleteTransactionNode", {
                                            id: context.id
                                        });
                                    }

                                    // Update the area
                                    area.update('node');
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
                                    
                                    // Update the node's controls
                                    context.controls.name.setValue(name);
                                    context.controls.color.setValue(color || "#aabbcc");
                                    context.controls.description.setValue(description || "");
                                    context.controls.condition.setValue(condition);

                                    // Update the node's label and style
                                    context.label = name;
                                    context.style = { backgroundColor: color || "#aabbcc", color: 'white' };

                                    // Force update
                                    applyNodeColor(context);
                                    
                                    // Trigger area update
                                    area.update('node');

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
                                }, true); // Pass true to indicate we're editing
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
    });

    render.addPreset(ReactPresets.classic.setup());
    render.addPreset(ReactPresets.contextMenu.setup());

    render.addPipe((ctx) => {
        if (ctx.type === "rendered" && ctx.data.type === "node") {
            applyNodeColor(ctx.data.payload);
        }
        return ctx;
    });

    connection.addPreset(ConnectionPresets.classic.setup());
    arrange.addPreset(ArrangePresets.classic.setup());

    editor.use(area);
    area.use(connection);
    area.use(render);
    area.use(arrange);
    area.use(contextMenu);

    const animatedApplier = new ArrangeAppliers.TransitionApplier({
        duration: 500,
        timingFunction: easeInOut
    });

    AreaExtensions.selectableNodes(area, AreaExtensions.selector(), {
        accumulating: AreaExtensions.accumulateOnCtrl()
    });
    AreaExtensions.simpleNodesOrder(area);

    insertableNodes(area, {
        async createConnections(node, connection) {
            await editor.addConnection(new Connection(
                editor.getNode(connection.source),
                connection.sourceOutput,
                node,
                "port"
            ));
            await editor.addConnection(new Connection(
                node,
                "port",
                editor.getNode(connection.target),
                connection.targetInput
            ));
            arrange.layout({ applier: animatedApplier });
        }
    });

    // const nodes = [new Node(), new Node(), new Node(), new Node()];
    // for (const n of nodes) {
    //     await editor.addNode(n);
    // }

    // await editor.addConnection(new Connection(nodes[0], "port", nodes[1], "port"));
    // await editor.addConnection(new Connection(nodes[1], "port", nodes[2], "port"));

    // await arrange.layout();
    // AreaExtensions.zoomAt(area, editor.getNodes());

    return {
        destroy: () => area.destroy()
    };
}
