import { NodeEditor } from "rete";
import { checkElementIntersectPath } from "./utils";

export function checkIntersection(position, size, connections) {
    const paths = connections.map(([id, element]) => {
        const path = element.querySelector("path");
        if (!path) throw new Error("path not found");
        return [id, element, path];
    });

    for (const [id, , path] of paths) {
        if (checkElementIntersectPath({ ...position, ...size }, path)) {
            return id;
        }
    }

    return false;
}

export function insertableNodes(area, props) {
    area.addPipe(async (context) => {
        if (context.type === "nodedragged") {
            const editor = area.parentScope(NodeEditor);
            const node = editor.getNode(context.data.id);
            const view = area.nodeViews.get(context.data.id);
            const cons = Array.from(area.connectionViews.entries()).map(
                ([id, view]) => [id, view.element]
            );

            if (view) {
                const id = checkIntersection(view.position, node, cons);
                if (id) {
                    const exist = editor.getConnection(id);
                    if (exist.source !== node.id && exist.target !== node.id) {
                        await editor.removeConnection(id);
                        await props.createConnections(node, exist);
                    }
                }
            }
        }
        return context;
    });
}
