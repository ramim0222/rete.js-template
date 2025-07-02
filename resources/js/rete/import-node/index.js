// Function to create and handle the import modal
import { Node } from '../Node';
import { applyNodeColor } from '../nodeStyles';

export function setupImportModal() {
    // Create modal HTML structure
    const modalHTML = `
        <div id="importModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 hidden items-center justify-center z-50">
            <div class="bg-white p-6 rounded-lg shadow-xl w-3/4 max-w-2xl">
                <h3 class="text-lg font-semibold mb-4">Import Node Configuration</h3>
                <textarea
                    id="jsonInput"
                    class="w-full h-64 p-4 border border-gray-300 rounded-lg mb-4 font-mono text-sm"
                    placeholder="Paste your JSON configuration here..."
                ></textarea>
                <div class="flex justify-end gap-3">
                    <button
                        id="cancelImport"
                        class="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                    >
                        Cancel
                    </button>
                    <button
                        id="confirmImport"
                        class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                        Import
                    </button>
                </div>
            </div>
        </div>
    `;

    // Add modal to the document
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // Get DOM elements
    const importButton = document.getElementById('importButton');
    const importModal = document.getElementById('importModal');
    const cancelImport = document.getElementById('cancelImport');
    const confirmImport = document.getElementById('confirmImport');
    const jsonInput = document.getElementById('jsonInput');

    // Show modal when import button is clicked
    importButton.addEventListener('click', () => {
        importModal.classList.remove('hidden');
        importModal.classList.add('flex');
    });

    // Hide modal when cancel is clicked
    cancelImport.addEventListener('click', () => {
        importModal.classList.add('hidden');
        importModal.classList.remove('flex');
        jsonInput.value = '';
    });

    // Handle import confirmation
    confirmImport.addEventListener('click', async () => {
        try {
            const jsonData = JSON.parse(jsonInput.value);

            // Get the editor instance and area plugin
            const editorInstance = window.editorInstance;

            // Get area plugin from editor - this is the key fix
            let areaPlugin = null;
            if (editorInstance && editorInstance.plugins) {
                // Find the area plugin in the editor's plugins
                for (const plugin of editorInstance.plugins) {
                    if (plugin.name === 'area' || plugin instanceof AreaPlugin) {
                        areaPlugin = plugin;
                        break;
                    }
                }
            }

            // Alternative way to get area plugin if the above doesn't work
            if (!areaPlugin && window.areaInstance) {
                areaPlugin = window.areaInstance;
            }

            if (editorInstance && areaPlugin) {
                // Clear existing nodes and connections
                const existingNodes = editorInstance.getNodes();
                existingNodes.forEach(node => {
                    editorInstance.removeNode(node.id);
                });

                // Import nodes
                if (jsonData.nodes) {
                    // Create all nodes first
                    for (const nodeData of jsonData.nodes) {
                        // Create a new node using our Node class with all initial data
                        const node = new Node(
                            nodeData.data.name,
                            nodeData.data.color,
                            nodeData.data.description,
                            nodeData.data.condition
                        );

                        // Set node ID
                        node.id = nodeData.id;

                        // Add node to editor first
                        await editorInstance.addNode(node);

                        // CRITICAL FIX: Use area.translate() to position the node
                        // This is the proper way to position nodes in Rete.js
                        await areaPlugin.translate(node.id, {
                            x: nodeData.position.x,
                            y: nodeData.position.y
                        });

                        // Apply color styling
                        setTimeout(() => {
                            applyNodeColor(node);
                        }, 100);
                    }
                }

                // Import connections after all nodes are created
                if (jsonData.connections) {
                    for (const conn of jsonData.connections) {
                        const sourceNode = editorInstance.getNode(conn.sourceNodeId);
                        const targetNode = editorInstance.getNode(conn.targetNodeId);

                        if (sourceNode && targetNode) {
                            await editorInstance.addConnection({
                                id: conn.id,
                                source: conn.sourceNodeId,
                                sourceOutput: conn.sourceOutput,
                                target: conn.targetNodeId,
                                targetInput: conn.targetInput
                            });
                        }
                    }
                }

                // Close modal
                importModal.classList.add('hidden');
                importModal.classList.remove('flex');
                jsonInput.value = '';

                // Force area update to ensure everything is rendered correctly
                await areaPlugin.update('node');

                // Optional: Zoom to fit all imported nodes
                setTimeout(() => {
                    if (window.AreaExtensions && window.AreaExtensions.zoomAt) {
                        window.AreaExtensions.zoomAt(areaPlugin, editorInstance.getNodes());
                    }
                }, 200);

            } else {
                alert('Editor instance or area plugin not found!');
                console.error('Editor instance:', editorInstance);
                console.error('Area plugin:', areaPlugin);
            }
        } catch (error) {
            console.error('Import error:', error);
            alert('Error importing configuration: ' + error.message);
        }
    });

    // Close modal when clicking outside
    importModal.addEventListener('click', (e) => {
        if (e.target === importModal) {
            importModal.classList.add('hidden');
            importModal.classList.remove('flex');
            jsonInput.value = '';
        }
    });
}