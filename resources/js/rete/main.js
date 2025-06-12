import { createEditor } from "./editor";

window.addEventListener("DOMContentLoaded", async () => {
    const container = document.getElementById("editor");
    if (container) {
        await createEditor(container);
    }
});
