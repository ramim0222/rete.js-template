import { createEditor } from "./editor.js";
import { submitDrawerForm } from "./editor.js";






window.addEventListener("DOMContentLoaded", async () => {
    const container = document.getElementById("editor");

    let drawerCallback = null;

function openDrawer(callback) {
    drawerCallback = callback;
    document.getElementById('nodeDrawer').style.right = '0';
}



function submitNodeForm() {
    const name = document.getElementById('nodeName').value;
    const color = document.getElementById('nodeColor').value;
    const description = document.getElementById('nodeDesc').value;
    const condition = document.getElementById('nodeCondition').value;

    if (drawerCallback) drawerCallback({ name, color, description, condition });
    submitDrawerForm({ name, color, description, condition });



    // closeDrawer();
}

window.submitNodeForm = submitNodeForm;
// window.closeDrawer = closeDrawer;

    if (container) {
        await createEditor(container);
    }
});
