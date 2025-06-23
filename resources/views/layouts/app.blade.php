<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <title>Laravel + Rete.js</title>

    @vite(['resources/css/app.css', 'resources/js/app.js'])
    @livewireStyles
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap">
    <style>
        html,
        body,
        #editor {
            margin: 0;
            padding: 0;
            width: 100vw;
            height: 100vh;
            overflow: hidden;
        }

        #info {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            color: #9f7b00;
            text-align: center;
            margin: 1em;
            z-index: 10;
        }

        .rete-node .input-control {
            margin-top: 10px;
        }

        .imUmXP {
            border: none !important;
            background-color: #08630b !important;
        }
    </style>
    <style>
        /* Dynamic color application for nodes based on color input value */
        [data-testid="node"] {
            /* transition: background-color 0.3s ease; */
            border: none !important;
        }

        /* JavaScript will be injected here to handle the dynamic coloring */
    </style>

    <script>
        // Color utility functions
        function hexToRgb(hex) {
            // Remove # if present
            hex = hex.replace('#', '');

            // Handle shorthand hex
            if (hex.length === 3) {
                hex = hex.split('').map(char => char + char).join('');
            }

            const r = parseInt(hex.substring(0, 2), 16);
            const g = parseInt(hex.substring(2, 4), 16);
            const b = parseInt(hex.substring(4, 6), 16);

            return { r, g, b };
        }

        function parseColor(color) {
            if (color.startsWith('#')) {
                return hexToRgb(color);
            } else if (color.startsWith('rgb')) {
                const matches = color.match(/\d+/g);
                return {
                    r: parseInt(matches[0]),
                    g: parseInt(matches[1]),
                    b: parseInt(matches[2])
                };
            } else {
                // For named colors, create a temporary div to get RGB values
                const temp = document.createElement('div');
                temp.style.color = color;
                document.body.appendChild(temp);
                const computedColor = window.getComputedStyle(temp).color;
                document.body.removeChild(temp);
                const matches = computedColor.match(/\d+/g);
                return {
                    r: parseInt(matches[0]),
                    g: parseInt(matches[1]),
                    b: parseInt(matches[2])
                };
            }
        }

        function getContrastColor(backgroundColor) {
            try {
                const rgb = parseColor(backgroundColor);
                // Calculate relative luminance
                const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
                return luminance > 0.5 ? '#000000' : '#FFFFFF';
            } catch (e) {
                console.error('Error calculating contrast color:', e);
                return '#FFFFFF'; // Default to white text if there's an error
            }
        }

        function applyNodeColor(node) {
            const applyImmediate = () => {
                // Try multiple selectors to find the node element
                let el = document.querySelector(`[data-node-id="${node.id}"]`);
                
                if (!el) {
                    // Fallback: find by checking all nodes and match by position or other criteria
                    const allNodes = document.querySelectorAll('[data-testid="node"]');
                    for (const nodeEl of allNodes) {
                        if (!nodeEl.dataset.nodeId) {
                            // This might be our new node - assign the ID and use it
                            nodeEl.dataset.nodeId = node.id;
                            el = nodeEl;
                            break;
                        }
                    }
                }
                
                if (el && node.controls?.color?.value) {
                    const color = node.controls.color.value;
                    const textColor = getContrastColor(color);
                    
                    // Apply background color with !important to override existing styles
                    el.style.setProperty('background-color', color, 'important');
                    el.style.setProperty('background', color, 'important');
                    el.style.setProperty('border', 'none', 'important');

                    // Update title immediately
                    const titleEl = el.querySelector('[data-testid="title"]');
                    if (titleEl) {
                        titleEl.textContent = node.controls.name.value || node.label;
                        titleEl.style.setProperty('color', textColor, 'important');
                        titleEl.style.setProperty('font-weight', 'bold', 'important');
                        titleEl.style.setProperty('font-family', 'Roboto, sans-serif', 'important');
                    }

                    // Update description immediately
                    const descEl = el.querySelector('[data-testid="control-description"] p');
                    if (descEl) {
                        descEl.textContent = node.controls.description.value || '';
                        descEl.style.setProperty('color', textColor, 'important');
                        descEl.style.setProperty('font-family', 'Roboto, sans-serif', 'important');
                        descEl.style.setProperty('font-size', '14px', 'important');
                        descEl.style.setProperty('margin', '5px 0', 'important');
                        descEl.style.setProperty('padding', '2px', 'important');
                    }

                    // Update condition immediately
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
                        condEl.style.setProperty('color', textColor, 'important');
                        condEl.style.setProperty('font-family', 'Roboto, sans-serif', 'important');
                        condEl.style.setProperty('font-size', '14px', 'important');
                        condEl.style.setProperty('font-style', 'italic', 'important');
                        condEl.style.setProperty('margin', '5px 0', 'important');
                        condEl.style.setProperty('padding', '2px', 'important');
                    }

                    // Hide control elements immediately
                    const nameControl = el.querySelector('[data-testid="control-name"]');
                    if (nameControl) {
                        nameControl.style.setProperty('display', 'none', 'important');
                    }

                    const colorControl = el.querySelector('[data-testid="control-color"]');
                    if (colorControl) {
                        colorControl.style.setProperty('display', 'none', 'important');
                    }

                    return true; // Success
                }
                return false; // Failed to find element or apply styles
            };

            // Try immediate application first
            if (!applyImmediate()) {
                // If immediate application failed, try with small delays
                setTimeout(() => {
                    if (!applyImmediate()) {
                        setTimeout(() => {
                            applyImmediate();
                        }, 100);
                    }
                }, 50);
            }
        }

        function nodeStyle(){
            // Add condition value mapping
            const conditionMap = {
                'equals': 'Equals',
                'not_equals': 'Not Equals',
                'greater_than': 'Greater Than',
                'less_than': 'Less Than'
            };

            // Bold the title elements
            const titles = document.querySelectorAll('[data-testid="title"]');
            titles.forEach(title => {
                title.style.setProperty('font-weight', 'bold', 'important');
                title.style.setProperty('font-family', 'Roboto, sans-serif', 'important');
            });

            // Assign unique IDs to nodes
            const nodes = document.querySelectorAll('[data-testid="node"]');
            nodes.forEach((node, index) => {
                if (!node.id) {
                    const uniqueId = 'node-' + Date.now() + '-' + index;
                    node.id = uniqueId;
                }
            });

            // Hide name control elements
            const nameControls = document.querySelectorAll('[data-testid="control-name"]');
            nameControls.forEach(control => {
                control.style.setProperty('display', 'none', 'important');
            });

            // Hide color control elements
            const colorControls = document.querySelectorAll('[data-testid="control-color"]');
            colorControls.forEach(control => {
                control.style.setProperty('display', 'none', 'important');
            });

            // Replace input fields with paragraph tags in description controls
            const descriptionControls = document.querySelectorAll('[data-testid="control-description"]');
            descriptionControls.forEach(control => {
                const input = control.querySelector('input');
                if (input) {
                    // Create a new paragraph element
                    const paragraph = document.createElement('p');
                    paragraph.textContent = input.value || input.getAttribute('value') || '';
                    paragraph.style.margin = '5px 0';
                    paragraph.style.padding = '2px';
                    paragraph.style.fontFamily = 'Roboto, sans-serif';
                    paragraph.style.fontSize = '14px';

                    // Get the background color from the parent node and set contrasting text color
                    const nodeDiv = control.closest('[data-testid="node"]');
                    if (nodeDiv) {
                        const backgroundColor = window.getComputedStyle(nodeDiv).backgroundColor;
                        paragraph.style.setProperty('color', getContrastColor(backgroundColor), 'important');
                    } else {
                        paragraph.style.setProperty('color', '#FFFFFF', 'important');
                    }

                    // Replace the input with the paragraph
                    input.parentNode.replaceChild(paragraph, input);
                }
            });

            // Handle condition controls
            const conditionControls = document.querySelectorAll('[data-testid="control-condition"]');
            conditionControls.forEach(control => {
                const input = control.querySelector('input');
                if (input) {
                    // Create a new paragraph element for condition
                    const paragraph = document.createElement('p');
                    const conditionValue = input.value || input.getAttribute('value') || '';
                    const displayCondition = conditionMap[conditionValue] || conditionValue;
                    paragraph.textContent = `Condition: ${displayCondition}`;
                    paragraph.style.margin = '5px 0';
                    paragraph.style.padding = '2px';
                    paragraph.style.fontFamily = 'Roboto, sans-serif';
                    paragraph.style.fontSize = '14px';
                    paragraph.style.fontStyle = 'italic';

                    // Get the background color from the parent node and set contrasting text color
                    const nodeDiv = control.closest('[data-testid="node"]');
                    if (nodeDiv) {
                        const backgroundColor = window.getComputedStyle(nodeDiv).backgroundColor;
                        paragraph.style.setProperty('color', getContrastColor(backgroundColor), 'important');
                    } else {
                        paragraph.style.setProperty('color', '#FFFFFF', 'important');
                    }

                    // Replace the input with the paragraph
                    input.parentNode.replaceChild(paragraph, input);
                }
            });
        }

        // Keep track of node order
        let nodeOrder = [];

        function handlePorts() {
            const nodes = document.querySelectorAll('[data-testid="node"]');
            
            if (nodes.length === 0) return;

            // Update node order list with any new nodes
            nodes.forEach((node) => {
                if (!node.id) {
                    node.id = `node-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
                }
                
                // Use data-node-id if available, fallback to element id
                const nodeIdentifier = node.dataset.nodeId || node.id;
                
                if (!nodeOrder.includes(nodeIdentifier)) {
                    nodeOrder.push(nodeIdentifier);
                }
            });

            // Clean up nodeOrder to remove nodes that no longer exist
            nodeOrder = nodeOrder.filter(id => {
                return document.getElementById(id) || document.querySelector(`[data-node-id="${id}"]`);
            });

            // If no nodes in order, rebuild the order based on current DOM
            if (nodeOrder.length === 0 && nodes.length > 0) {
                nodes.forEach(node => {
                    const nodeIdentifier = node.dataset.nodeId || node.id;
                    nodeOrder.push(nodeIdentifier);
                });
            }

            // Get first and last node identifiers from our tracked order
            const firstNodeId = nodeOrder[0];
            const lastNodeId = nodeOrder[nodeOrder.length - 1];

            console.log('Node order:', nodeOrder);
            console.log('First node:', firstNodeId, 'Last node:', lastNodeId);

            nodes.forEach((node) => {
                const nodeIdentifier = node.dataset.nodeId || node.id;
                
                // Handle input ports
                const inputPorts = node.querySelectorAll('[data-testid="input-port"]');
                inputPorts.forEach((input, portIndex) => {
                    if (!input.id) {
                        input.id = `input-port-${nodeIdentifier}-${portIndex}-${Date.now()}`;
                    }

                    if (nodeIdentifier === firstNodeId) {
                        input.style.setProperty('display', 'none', 'important');
                        console.log('Hiding input port for first node:', nodeIdentifier);
                    } else {
                        input.style.removeProperty('display');
                        input.style.setProperty('display', 'block', 'important');
                        console.log('Showing input port for node:', nodeIdentifier);
                    }
                });

                // Handle output ports
                const outputPorts = node.querySelectorAll('[data-testid="output-port"]');
                outputPorts.forEach((output, portIndex) => {
                    if (!output.id) {
                        output.id = `output-port-${nodeIdentifier}-${portIndex}-${Date.now()}`;
                    }

                    if (nodeIdentifier === lastNodeId) {
                        output.style.setProperty('display', 'none', 'important');
                        console.log('Hiding output port for last node:', nodeIdentifier);
                    } else {
                        output.style.removeProperty('display');
                        output.style.setProperty('display', 'block', 'important');
                        console.log('Showing output port for node:', nodeIdentifier);
                    }
                });
            });
        }

        // Apply colors when page loads
        document.addEventListener('DOMContentLoaded', function() {
            // Initial application
            setTimeout(applyNodeColors, 100);
            setTimeout(nodeStyle, 100);
            setTimeout(handlePorts, 100);

            // Enhanced MutationObserver that properly handles React updates
            const observer = new MutationObserver(function(mutations) {
                let shouldApply = false;
                let shouldHandlePorts = false;
                
                mutations.forEach(function(mutation) {
                    if (mutation.type === 'childList') {
                        // Check if nodes were added or removed
                        const addedNodes = Array.from(mutation.addedNodes);
                        const removedNodes = Array.from(mutation.removedNodes);
                        
                        const hasNodeChanges = addedNodes.some(node => 
                            node.nodeType === 1 && (
                                node.hasAttribute?.('data-testid') ||
                                node.querySelector?.('[data-testid="node"]')
                            )
                        ) || removedNodes.some(node => 
                            node.nodeType === 1 && (
                                node.hasAttribute?.('data-testid') ||
                                node.querySelector?.('[data-testid="node"]')
                            )
                        );
                        
                        if (hasNodeChanges) {
                            shouldApply = true;
                            shouldHandlePorts = true;
                        }
                    } else if (mutation.type === 'attributes' && 
                            (mutation.attributeName === 'data-testid' || 
                                mutation.attributeName === 'data-node-id')) {
                        shouldApply = true;
                        shouldHandlePorts = true;
                    }
                });
                
                if (shouldApply) {
                    setTimeout(() => {
                        applyNodeColors();
                        nodeStyle();
                    }, 50);
                }
                
                if (shouldHandlePorts) {
                    setTimeout(() => {
                        handlePorts();
                    }, 100);
                }
            });

            // Observe the entire document for changes
            observer.observe(document.body, {
                childList: true,
                subtree: true,
                attributes: true,
                attributeFilter: ['data-testid', 'data-node-id']
            });

            // Listen for input changes on color fields
            document.addEventListener('input', function(e) {
                if (e.target.closest('[data-testid="control-color"]')) {
                    setTimeout(applyNodeColors, 50);
                }
            });

            // Listen for any changes to input values
            document.addEventListener('change', function(e) {
                if (e.target.closest('[data-testid="control-color"]')) {
                    applyNodeColors();
                }
            });
        });

        if (!window.nodeOrder) {
            window.nodeOrder = [];
        }

        window.handlePorts = handlePorts;

        // Also expose the function globally so it can be called from React/Livewire
        window.applyNodeColors = applyNodeColors;
        window.nodeStyle = nodeStyle;
    </script>
</head>

<body>

    @yield('content')

    @livewireScripts
    @stack('scripts')
</body>

</html>
