import { createEditor } from "./editor.js";

window.addEventListener("DOMContentLoaded", async () => {
    const container = document.getElementById("editor");
    if (container) {
        await createEditor(container);
    }
});
