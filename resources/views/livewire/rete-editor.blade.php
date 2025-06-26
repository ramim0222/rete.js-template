<div wire:ignore>

    <style>

    .drawer-input {
        width: 100%;
        padding: 5px;
        margin-bottom: 10px;
    }

    </style>

    <!-- Drawer -->
<div id="nodeDrawer" style="position: fixed; top: 0; right:-500px;  width: 400px; height: 100%; background: #fff; box-shadow: -2px 0 10px rgba(0,0,0,0.3); transition: right 0.3s; padding: 20px; z-index: 9999;">
    <h3 id="drawerTitle">Create Node</h3>
    <label>Name</label>
    <input type="text" id="nodeName" class="drawer-input w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Enter Status Name" /><br/><br/>

    <label>Color (hex)</label>
    <input type="text" id="nodeColor" class="drawer-input w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="#aabbcc"  /><br/><br/>

    <label>Description</label>
    <textarea id="nodeDesc" rows="4" class="drawer-input w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Enter Description"></textarea><br/><br/>

    <label>Select Condition</label>
    <select id="nodeCondition" class="drawer-input w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
        <option value="equals">Equals</option>
        <option value="not_equals">Not Equals</option>
        <option value="greater_than">Greater Than</option>
        <option value="less_than">Less Than</option>
    </select>

    <button id="submitButton" onclick="submitNodeForm()" class="px-6 py-2 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2">Create Node</button>
    <button onclick="closeDrawer()" class="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2">Close</button>
</div>

<script>
    let drawerCallback = null;
    let isEditing = false;
    let editorInstance = null;

    // Add function to set editor instance
    window.setEditorInstance = function(editor) {
        editorInstance = editor;

        // Set up save button functionality once we have the editor instance
        const saveButton = document.getElementById('saveButton');
        if (saveButton) {
            saveButton.addEventListener('click', () => {
                if (editorInstance) {
                    const nodes = editorInstance.getNodes();
                    const connections = editorInstance.getConnections();
                    let output = "Status Flow Configuration\n";
                    output += "======================\n\n";

                    // Add nodes information
                    output += "Nodes:\n";
                    output += "------\n";
                    nodes.forEach(node => {
                        const data = node.data();
                        output += `\nName: ${data.name}\n`;
                        output += `Color: ${data.color}\n`;
                        output += `Description: ${data.description || 'N/A'}\n`;
                        output += `Condition: ${data.condition || 'N/A'}\n`;
                        output += `Position: (${Math.round(node.position[0])}, ${Math.round(node.position[1])})\n`;
                        output += `ID: ${node.id}\n`;
                        output += "------------------------\n";
                    });

                    // Add connections information
                    output += "\nConnections:\n";
                    output += "-----------\n";
                    connections.forEach(conn => {
                        const sourceNode = nodes.find(n => n.id === conn.source);
                        const targetNode = nodes.find(n => n.id === conn.target);
                        output += `\nFrom: ${sourceNode ? sourceNode.data().name : 'Unknown'} (ID: ${conn.source})`;
                        output += `\nTo: ${targetNode ? targetNode.data().name : 'Unknown'} (ID: ${conn.target})\n`;
                        output += "------------------------\n";
                    });

                    // Add JSON representation at the bottom
                    output += "\nJSON Data:\n";
                    output += "-----------\n";
                    const jsonData = {
                        nodes: nodes.map(node => ({
                            id: node.id,
                            data: node.data(),
                            position: {
                                x: Math.round(node.position[0]),
                                y: Math.round(node.position[1])
                            }
                        })),
                        connections: connections.map(conn => ({
                            id: conn.id,
                            sourceNodeId: conn.source,
                            targetNodeId: conn.target,
                            sourceOutput: conn.sourceOutput,
                            targetInput: conn.targetInput
                        })),
                        metadata: {
                            exportedAt: new Date().toISOString(),
                            totalNodes: nodes.length,
                            totalConnections: connections.length
                        }
                    };

                    output += JSON.stringify(jsonData, null, 2);

                    // Download the file
                    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
                    const blob = new Blob([output], { type: 'text/plain' });
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `status-flow-${timestamp}.txt`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    window.URL.revokeObjectURL(url);
                }
            });
        }
    };

    function openDrawer(callback, editing = false) {
        drawerCallback = callback;
        isEditing = editing;
        document.getElementById('drawerTitle').textContent = editing ? 'Edit Node' : 'Create Node';
        document.getElementById('submitButton').textContent = editing ? 'Save Changes' : 'Create Node';
        document.getElementById('nodeDrawer').style.right = '0';
    }

    function submitNodeForm() {
        const name = document.getElementById('nodeName').value;
        const color = document.getElementById('nodeColor').value;
        const description = document.getElementById('nodeDesc').value;
        const condition = document.getElementById('nodeCondition').value;

        if (drawerCallback) {
            drawerCallback({ name, color, description, condition });
        }
        closeDrawer();
    }

    function closeDrawer() {
        document.getElementById('nodeDrawer').style.right = '-500px';
        if (!isEditing) {
            // Only clear form if we're not editing
            document.getElementById('nodeName').value = '';
            document.getElementById('nodeColor').value = '';
            document.getElementById('nodeDesc').value = '';
            document.getElementById('nodeCondition').value = 'equals';
        }
        drawerCallback = null;
        isEditing = false;
    }

    window.openDrawer = openDrawer;
    window.submitNodeForm = submitNodeForm;
    window.closeDrawer = closeDrawer;

    function handlePorts() {
        const nodes = document.querySelectorAll('[data-testid="node"]');

        // Only proceed if we have nodes
        if (!nodes.length) return;

        // Update node order list with any new nodes
        nodes.forEach((node) => {
            if (!node.id) {
                node.id = `node-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            }
            if (!nodeOrder.includes(node.id)) {
                nodeOrder.push(node.id);
            }
        });

        // Clean up nodeOrder to remove nodes that no longer exist
        nodeOrder = nodeOrder.filter(id => document.getElementById(id));

        // Get first and last node IDs from our tracked order
        const firstNodeId = nodeOrder[0];
        const lastNodeId = nodeOrder[nodeOrder.length - 1];

        nodes.forEach((node) => {
            // Handle input ports
            const inputSocket = node.querySelectorAll('[data-testid="input-socket"]');
            inputSocket.forEach((input, portIndex) => {
                if (!input.id) {
                    input.id = `input-port-${node.id}-${portIndex}-${Date.now()}`;
                }

                if (node.id === firstNodeId) {
                    input.style.setProperty('display', 'none', 'important');
                } else {
                    input.style.removeProperty('display');
                }
            });

            //fix height input port
            const inputPorts = node.querySelectorAll('[data-testid="input-port"]');
            inputPorts.forEach((input, portIndex) => {
                if (!input.id) {
                    input.id = `input-port-${node.id}-${portIndex}-${Date.now()}`;
                }

                if (node.id === firstNodeId) {
                    input.style.setProperty('height', '36px', 'important');
                }
            });

            // Handle output ports
            const outputSocket = node.querySelectorAll('[data-testid="output-socket"]');
            outputSocket.forEach((output, portIndex) => {
                if (!output.id) {
                    output.id = `output-port-${node.id}-${portIndex}-${Date.now()}`;
                }

                if (node.id === lastNodeId) {
                    output.style.setProperty('display', 'none', 'important');
                } else {
                    output.style.removeProperty('display');
                }
            });

            //output port height fix
            const outputPort = node.querySelectorAll('[data-testid="output-port"]');
            outputPort.forEach((output, portIndex) => {
                if (!output.id) {
                    output.id = `output-port-${node.id}-${portIndex}-${Date.now()}`;
                }

                if (node.id === lastNodeId) {
                    output.style.setProperty('height', '36px', 'important');
                }
            });
        });
    }

    // Debounce function to limit how often we update
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Debounced versions of our update functions
    const debouncedApplyColors = debounce(applyNodeColors, 250);
    const debouncedNodeStyle = debounce(nodeStyle, 250);
    const debouncedHandlePorts = debounce(handlePorts, 250);

    // Track if we're currently processing updates
    let isProcessingUpdates = false;

    // Apply colors when page loads
    document.addEventListener('DOMContentLoaded', function() {
        // Initial application with a slight delay to ensure DOM is ready
        setTimeout(() => {
            debouncedApplyColors();
            debouncedNodeStyle();
            debouncedHandlePorts();
        }, 100);

        // Create a single observer for all changes
        const observer = new MutationObserver(function(mutations) {
            if (isProcessingUpdates) return;

            let shouldApply = false;
            for (const mutation of mutations) {
                if (mutation.type === 'childList' ||
                    (mutation.type === 'attributes' && mutation.attributeName === 'data-testid')) {
                    shouldApply = true;
                    break;
                }
            }

            if (shouldApply) {
                isProcessingUpdates = true;
                Promise.all([
                    debouncedApplyColors(),
                    debouncedNodeStyle(),
                    debouncedHandlePorts()
                ]).finally(() => {
                    isProcessingUpdates = false;
                });
            }
        });

        // Observe only the editor container
        const editorContainer = document.getElementById('editor');
        if (editorContainer) {
            observer.observe(editorContainer, {
                childList: true,
                subtree: true,
                attributes: true,
                attributeFilter: ['data-testid']
            });
        }

        // Handle color input changes
        document.addEventListener('input', (e) => {
            if (e.target.closest('[data-testid="control-color"]')) {
                debouncedApplyColors();
            }
        });
    });
</script>


<section id="editor-section" class=" h-screen w-full bg-gray-200 flex flex-col gap-3 justify-center items-center">

    <div  class=" rounded-lg shadow-xl overflow-hidden border border-gray-300 w-5/6 h-5/6">
        <div id="info" class="text-center rounded-md text-gray-700">Drag the unconnected node onto the connection between nodes</div>
        <div id="editor" class="bg-white rounded-lg" wire:ignore style= "overflow: hidden; touch-action: none;"></div>
    </div>

    <div class="flex justify-end gap-3">
        <button id="importButton" class="bg-green-500 hover:bg-green-700 text-white px-4 py-2 rounded-md shadow-md">Import Node</button>
        <button id="saveButton" class="bg-blue-500 hover:bg-blue-700 text-white px-4 py-2 rounded-md shadow-md">Save</button>
    </div>

</section>




@vite('resources/js/rete/main.js')


</div>
