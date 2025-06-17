import { NodeEditor, ClassicPreset } from "rete";
import { AreaPlugin, AreaExtensions } from "rete-area-plugin";
import { ConnectionPlugin, Presets as ConnectionPresets } from "rete-connection-plugin";
import { ReactPlugin, Presets as ReactPresets } from "rete-react-plugin";
import { AutoArrangePlugin, Presets as ArrangePresets, ArrangeAppliers } from "rete-auto-arrange-plugin";
import { ContextMenuPlugin, Presets as ContextMenuPresets } from "rete-context-menu-plugin";
import { easeInOut } from "popmotion";
import { insertableNodes } from "./insert-node/index";

const socket = new ClassicPreset.Socket("socket");

let drawerCallback = null;

function openDrawer(callback) {
    drawerCallback = callback;
    document.getElementById("nodeDrawer").style.right = "0";
}

export function submitDrawerForm(data) {
    if (drawerCallback) {
        drawerCallback(data); // ← this is where the data arrives!
        drawerCallback = null;
    }
    const name = document.getElementById('nodeName').value = "";
    const color = document.getElementById('nodeColor').value = "";
    const description = document.getElementById('nodeDesc').value = "";
    document.getElementById("nodeDrawer").style.right = "-100%";
}

class Node extends ClassicPreset.Node {
    constructor(name = "Status Name", color = "#aabbcc", description = "", condition = "equals") {
        super(name);
        this.style = { backgroundColor: '#4CAF50', color: 'white' };
        this.width = 'auto';
        this.height = 'auto';

        this.addInput("port", new ClassicPreset.Input(socket));
        this.addOutput("port", new ClassicPreset.Output(socket));

        this.addControl("name", new ClassicPreset.InputControl("text", { initial: name }));
        this.addControl("color", new ClassicPreset.InputControl("text", {
            initial: color,
            change: () => {
                const el = document.querySelector(`[data-node-id="${this.id}"]`);
                if (el) el.style.background = "#c42e2e";
            }
        }));
        this.addControl("description", new ClassicPreset.InputControl("text", { initial: description }));
        this.addControl("condition", new ClassicPreset.InputControl("text", { initial: condition }));
    }

    clone() {
        return new Node(
            this.controls.name.value,
            this.controls.color.value,
            this.controls.description.value,
            this.controls.condition.value
        );
    }

    data() {
        return {
            name: this.controls.name.value,
            color: this.controls.color.value,
            description: this.controls.description.value,
            condition: this.controls.condition.value
        };
    }
}

class Connection extends ClassicPreset.Connection {}

function applyNodeColor(node) {
    const el = document.querySelector(`[data-node-id="${node.id}"]`);
    if (el && node.controls?.color?.value) {
        el.style.background = node.controls.color.value;
    }
}

export async function createEditor(container) {
    const editor = new NodeEditor();
    const area = new AreaPlugin(container);
    const connection = new ConnectionPlugin();
    const render = new ReactPlugin();
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
                                openDrawer(async ({ name, color, description }) => {
                                    if (!name) return;

                                    const condition = document.getElementById('nodeCondition').value;
                                    const node = new Node(name, color || "#aabbcc", description || "", condition);

                                    // Calculate the center of the container
                                    const containerRect = container.getBoundingClientRect();
                                    const centerX = containerRect.width / 2;
                                    const centerY = containerRect.height / 2;

                                    // Position the node in the center of the container
                                    node.position = [centerX - 100, centerY - 120];

                                    await editor.addNode(node);

                                    // Wait until node is fully rendered before using its id
                                    render.addPipe((ctx) => {
                                        if (ctx.type === "rendered" && ctx.data.type === "node" && ctx.data.payload === node) {
                                            applyNodeColor(node);

                                            if (window.Livewire?.emit) {
                                                Livewire.emit("saveTransactionNode", {
                                                    name,
                                                    color,
                                                    description,
                                                    condition,
                                                    x: node.position[0],
                                                    y: node.position[1],
                                                    id: node.id,
                                                });
                                            }
                                        }
                                        return ctx;
                                    });
                                });
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
                                await editor.removeNode(context);
                            }
                        },
                        {
                            label: 'Clone',
                            key: 'clone',
                            handler: async () => {
                                const cloned = context.clone();
                                cloned.position = [context.position[0] + 10, context.position[1] + 10];
                                await editor.addNode(cloned);
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
