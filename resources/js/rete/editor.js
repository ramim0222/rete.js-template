import { NodeEditor, ClassicPreset } from "rete";
import { AreaPlugin, AreaExtensions } from "rete-area-plugin";
import {
    ConnectionPlugin,
    Presets as ConnectionPresets,
} from "rete-connection-plugin";
import { ReactPlugin, Presets as ReactPresets } from "rete-react-plugin";
import {
    AutoArrangePlugin,
    Presets as ArrangePresets,
    ArrangeAppliers,
} from "rete-auto-arrange-plugin";
import {
    ContextMenuPlugin,
    Presets as ContextMenuPresets,
} from "rete-context-menu-plugin";
import { easeInOut } from "popmotion";
import { insertableNodes } from "./insert-node/index";

const socket = new ClassicPreset.Socket("socket");

class Node extends ClassicPreset.Node {
    constructor() {
        super("Node");
        this.width = 180;
        this.height = 120;
        this.addInput("port", new ClassicPreset.Input(socket));
        this.addOutput("port", new ClassicPreset.Output(socket));
    }
}

class Connection extends ClassicPreset.Connection {}

export async function createEditor(container) {
    const editor = new NodeEditor();
    const area = new AreaPlugin(container);
    const connection = new ConnectionPlugin();
    const render = new ReactPlugin();
    const arrange = new AutoArrangePlugin();
    const contextMenu = new ContextMenuPlugin({
        items: ContextMenuPresets.classic.setup([["Node", () => new Node()]]),
    });

    render.addPreset(ReactPresets.classic.setup());
    render.addPreset(ReactPresets.contextMenu.setup());
    connection.addPreset(ConnectionPresets.classic.setup());
    arrange.addPreset(ArrangePresets.classic.setup());

    editor.use(area);
    area.use(connection);
    area.use(render);
    area.use(arrange);
    area.use(contextMenu);

    const animatedApplier = new ArrangeAppliers.TransitionApplier({
        duration: 500,
        timingFunction: easeInOut,
    });

    AreaExtensions.selectableNodes(area, AreaExtensions.selector(), {
        accumulating: AreaExtensions.accumulateOnCtrl(),
    });
    AreaExtensions.simpleNodesOrder(area);

    insertableNodes(area, {
        async createConnections(node, connection) {
            await editor.addConnection(
                new Connection(
                    editor.getNode(connection.source),
                    connection.sourceOutput,
                    node,
                    "port"
                )
            );
            await editor.addConnection(
                new Connection(
                    node,
                    "port",
                    editor.getNode(connection.target),
                    connection.targetInput
                )
            );
            arrange.layout({ applier: animatedApplier });
        },
    });

    const nodes = [new Node(), new Node(), new Node(), new Node()];
    for (const n of nodes) await editor.addNode(n);

    await editor.addConnection(
        new Connection(nodes[0], "port", nodes[1], "port")
    );
    await editor.addConnection(
        new Connection(nodes[1], "port", nodes[2], "port")
    );

    await arrange.layout();
    AreaExtensions.zoomAt(area, editor.getNodes());

    return {
        destroy: () => area.destroy(),
    };
}
