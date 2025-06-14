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
    constructor(name = "Status Name", color = "#aabbcc", description = "") {
        super(name);
        this.style = { backgroundColor: '#4CAF50', color: 'white' };
        this.width = 200;
        this.height = 240;

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
    }

    data() {
        return {
            name: this.controls.name.value,
            color: this.controls.color.value,
            description: this.controls.description.value
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
        items: ContextMenuPresets.classic.setup([
            [
                "New Status",
                async () => {
                    openDrawer(async ({ name, color, description }) => {

                        if (!name) return;


                        const node = new Node(name, color || "#aabbcc", description || "");
                        node.position = [50, 300];

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
            ]
        ])
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

    const nodes = [new Node(), new Node(), new Node(), new Node()];
    for (const n of nodes) {
        await editor.addNode(n);
    }

    await editor.addConnection(new Connection(nodes[0], "port", nodes[1], "port"));
    await editor.addConnection(new Connection(nodes[1], "port", nodes[2], "port"));

    await arrange.layout();
    AreaExtensions.zoomAt(area, editor.getNodes());

    return {
        destroy: () => area.destroy()
    };
}
