<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <title>Laravel + Rete.js</title>

    @livewireStyles
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
                        // Apply the background color
                        nodeDiv.style.setProperty('background-color', colorInput.value, 'important');
                        nodeDiv.style.setProperty('background', colorInput.value, 'important');
                    }
                }
            });
        }

        // Apply colors when page loads
        document.addEventListener('DOMContentLoaded', function() {
            // Initial application
            setTimeout(applyNodeColors, 100);

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
