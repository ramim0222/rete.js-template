import { NodeEditor } from "rete";
import { AreaPlugin, AreaExtensions } from "rete-area-plugin";
import { ConnectionPlugin, Presets as ConnectionPresets } from "rete-connection-plugin";
import { ReactPlugin, Presets as ReactPresets } from "rete-react-plugin";
import { AutoArrangePlugin, Presets as ArrangePresets, ArrangeAppliers } from "rete-auto-arrange-plugin";
import { ContextMenuPlugin } from "rete-context-menu-plugin";
import { easeInOut } from "popmotion";
import { insertableNodes } from "./insert-node/index";
import { createRoot } from 'react-dom/client';

import { Connection } from './Connection';
import { applyNodeColor, applyImmediateNodeStyling } from './nodeStyles';
import { createContextMenuConfig } from './contextMenu';
import { setupImportModal } from './import-node';

// Store editor and area instances globally
let editorInstance = null;
let areaInstance = null;

export async function createEditor(container) {
    const editor = new NodeEditor();
    const area = new AreaPlugin(container);
    const connection = new ConnectionPlugin();
    const render = new ReactPlugin({ createRoot });
    const arrange = new AutoArrangePlugin();
    const contextMenu = new ContextMenuPlugin(createContextMenuConfig(editor, area));

    render.addPreset(ReactPresets.classic.setup());
    render.addPreset(ReactPresets.contextMenu.setup());

    // Make both editor and area instances available globally
    editorInstance = editor;
    areaInstance = area;

    // Store globally for import function access
    window.editorInstance = editor;
    window.areaInstance = area;

    if (window.setEditorInstance) {
        window.setEditorInstance(editor);
    }

    // Enhanced control change listener with port management
    let updateTimeout;
    function scheduleNodeUpdate() {
        clearTimeout(updateTimeout);
        updateTimeout = setTimeout(() => {
            if (window.applyNodeColors) window.applyNodeColors();
            if (window.nodeStyle) window.nodeStyle();
            if (window.handlePorts) window.handlePorts();
        }, 100);
    }

    // Add render pipe for node styling
    render.addPipe((ctx) => {
        if (ctx.type === "rendered" && ctx.data.type === "node") {
            const node = ctx.data.payload;

            // Immediate styling application
            const immediateApply = () => {
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
                    applyImmediateNodeStyling(node, targetElement);
                }
            };

            // Apply immediately
            immediateApply();

            // Also apply with delays to catch timing issues
            setTimeout(() => {
                applyNodeColor(node);
                scheduleNodeUpdate();
            }, 10);

            setTimeout(() => {
                applyNodeColor(node);
                scheduleNodeUpdate();
            }, 100);

            // For new nodes, emit to Livewire
            if (node.isNewNode) {
                setTimeout(() => {
                    const nodeData = node.data();
                    if (window.Livewire?.emit) {
                        Livewire.emit("saveTransactionNode", {
                            name: nodeData.name,
                            color: nodeData.color,
                            description: nodeData.description,
                            condition: nodeData.condition,
                            x: node.position[0],
                            y: node.position[1],
                            id: node.id,
                        });
                    }
                    delete node.isNewNode;
                }, 200);
            }
        }
        return ctx;
    });

    // Listen for control changes
    editor.addPipe((ctx) => {
        if (ctx.type === "controlchange") {
            const node = ctx.data.node;
            applyNodeColor(node);
            scheduleNodeUpdate();
        }
        return ctx;
    });

    // Listen for node changes
    editor.addPipe((ctx) => {
        if (ctx.type === "nodeadded" || ctx.type === "noderemoved") {
            setTimeout(() => {
                if (window.handlePorts) {
                    window.handlePorts();
                }
            }, 100);
        }
        return ctx;
    });

    // Listen for connection changes
    editor.addPipe((ctx) => {
        if (ctx.type === "connectioncreated" || ctx.type === "connectionremoved") {
            setTimeout(() => {
                if (window.handlePorts) {
                    window.handlePorts();
                }
            }, 100);
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
        }
    });

    // Set up import functionality
    setupImportModal();

    // Make AreaExtensions globally available for zoom functions
    window.AreaExtensions = AreaExtensions;

    return {
        editor,
        area,
        destroy: () => {
            area.destroy();
            // Clear global references
            editorInstance = null;
            areaInstance = null;
            window.editorInstance = null;
            window.areaInstance = null;
        }
    };
}

// Export the instances getters
export function getEditor() {
    return editorInstance;
}

export function getArea() {
    return areaInstance;
}