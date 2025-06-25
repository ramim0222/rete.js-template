let drawerCallback = null;

export function openDrawer(callback, editing = false) {
    if (window.openDrawer) {
        // Use the global openDrawer function if available
        window.openDrawer(callback, editing);
    } else {
        // Fallback to basic functionality
        drawerCallback = callback;
        document.getElementById("nodeDrawer").style.right = "0";
    }
}

export function submitDrawerForm(data) {
    if (drawerCallback) {
        drawerCallback(data);
        drawerCallback = null;

        // Trigger immediate global updates after form submission
        setTimeout(() => {
            // Apply all styling functions multiple times to ensure they take effect
            if (window.applyNodeColors) window.applyNodeColors();
            if (window.nodeStyle) window.nodeStyle();
            if (window.handlePorts) window.handlePorts();
        }, 50);

        setTimeout(() => {
            if (window.applyNodeColors) window.applyNodeColors();
            if (window.nodeStyle) window.nodeStyle();
            if (window.handlePorts) window.handlePorts();
        }, 150);

        setTimeout(() => {
            if (window.applyNodeColors) window.applyNodeColors();
            if (window.nodeStyle) window.nodeStyle();
            if (window.handlePorts) window.handlePorts();
        }, 300);
    }
    document.getElementById("nodeDrawer").style.right = "-100%";
}
