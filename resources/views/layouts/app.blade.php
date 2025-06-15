<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <title>Laravel + Rete.js</title>

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

        function applyNodeColors() {
            // Find all color control spans
            const colorControls = document.querySelectorAll('[data-testid="control-color"]');

            colorControls.forEach(colorControl => {
                // Get the first input field inside this span
                const colorInput = colorControl.querySelector('input');

                if (colorInput && colorInput.value) {
                    // Find the closest parent div with data-testid="node"
                    const nodeDiv = colorControl.closest('[data-testid="node"]');

                    if (nodeDiv) {
                        const backgroundColor = colorInput.value;
                        const textColor = getContrastColor(backgroundColor);

                        // Apply the background color
                        nodeDiv.style.setProperty('background-color', backgroundColor, 'important');
                        nodeDiv.style.setProperty('background', backgroundColor, 'important');

                        // Apply contrasting text color to title
                        const titleElement = nodeDiv.querySelector('[data-testid="title"]');
                        if (titleElement) {
                            titleElement.style.setProperty('color', textColor, 'important');
                        }

                        // Apply contrasting text color to description
                        const descriptionElement = nodeDiv.querySelector('[data-testid="control-description"] p');
                        if (descriptionElement) {
                            descriptionElement.style.setProperty('color', textColor, 'important');
                        }
                    }
                }
            });
        }

        function nodeStyle(){
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
        }

        // Keep track of node order
        let nodeOrder = [];

        function handlePorts() {
            const nodes = document.querySelectorAll('[data-testid="node"]');

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
                const inputPorts = node.querySelectorAll('[data-testid="input-port"]');
                inputPorts.forEach((input, portIndex) => {
                    if (!input.id) {
                        input.id = `input-port-${node.id}-${portIndex}-${Date.now()}`;
                    }

                    if (node.id === firstNodeId) {
                        input.style.setProperty('display', 'none', 'important');
                    } else {
                        input.style.removeProperty('display');
                    }
                });

                // Handle output ports
                const outputPorts = node.querySelectorAll('[data-testid="output-port"]');
                outputPorts.forEach((output, portIndex) => {
                    if (!output.id) {
                        output.id = `output-port-${node.id}-${portIndex}-${Date.now()}`;
                    }

                    if (node.id === lastNodeId) {
                        output.style.setProperty('display', 'none', 'important');
                    } else {
                        output.style.removeProperty('display');
                    }
                });
            });

            console.log('Node order:', nodeOrder);
        }

        // Apply colors when page loads
        document.addEventListener('DOMContentLoaded', function() {
            // Initial application
            setTimeout(applyNodeColors, 100);
            setTimeout(nodeStyle, 100);
            setTimeout(handlePorts, 100);

            // Also apply when nodes are dynamically added/changed
            const observer = new MutationObserver(function(mutations) {
                let shouldApply = false;
                mutations.forEach(function(mutation) {
                    if (mutation.type === 'childList' ||
                        (mutation.type === 'attributes' && mutation.attributeName === 'data-testid')
                        ) {
                        shouldApply = true;
                    }
                });
                if (shouldApply) {
                    setTimeout(applyNodeColors, 100);
                    setTimeout(nodeStyle, 100);
                    setTimeout(handlePorts, 100);
                }
            });

            // Observe the entire document for changes
            observer.observe(document.body, {
                childList: true,
                subtree: true,
                attributes: true,
                attributeFilter: ['data-testid']
            });

            // Also listen for input changes on color fields
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

        // Also expose the function globally so it can be called from React/Livewire
        window.applyNodeColors = applyNodeColors;
    </script>
</head>

<body>

    @yield('content')

    @livewireScripts
    @stack('scripts')
</body>

</html>
