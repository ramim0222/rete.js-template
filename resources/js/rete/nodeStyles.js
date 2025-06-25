export function getContrastColor(hexcolor) {
    // Function to calculate contrasting text color
    const r = parseInt(hexcolor.slice(1, 3), 16);
    const g = parseInt(hexcolor.slice(3, 5), 16);
    const b = parseInt(hexcolor.slice(5, 7), 16);
    const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    return (yiq >= 128) ? 'black' : 'white';
}

export function applyNodeColor(node) {
    // Add a small delay to ensure DOM is ready
    setTimeout(() => {
        const el = document.querySelector(`[data-node-id="${node.id}"]`);
        if (el && node.controls?.color?.value) {
            // Apply background color
            el.style.background = node.controls.color.value;

            // Update title
            const titleEl = el.querySelector('[data-testid="title"]');
            if (titleEl) {
                titleEl.textContent = node.controls.name.value;
            }

            // Update description
            const descEl = el.querySelector('[data-testid="control-description"] p');
            if (descEl) {
                descEl.textContent = node.controls.description.value || '';
            }

            // Update condition
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
            }

            // Force a re-render of the node style
            if (window.nodeStyle) {
                window.nodeStyle();
            }
        }
    }, 50); // Small delay to ensure DOM updates are complete
}

export function applyImmediateNodeStyling(node, targetElement) {
    if (node.controls?.color?.value && targetElement) {
        // Apply background color
        const color = node.controls.color.value;
        targetElement.style.setProperty('background-color', color, 'important');
        targetElement.style.setProperty('background', color, 'important');

        // Calculate and apply contrasting text color
        const textColor = getContrastColor(color);

        // Update title with proper styling
        const titleEl = targetElement.querySelector('[data-testid="title"]');
        if (titleEl) {
            titleEl.textContent = node.controls.name.value || node.label;
            titleEl.style.setProperty('color', textColor, 'important');
            titleEl.style.setProperty('font-weight', 'bold', 'important');
            titleEl.style.setProperty('font-family', 'Roboto, sans-serif', 'important');
        }
    }
}
