import { WorkflowEditor } from './workflow-editor/WorkflowEditor.js';

console.log('=== Loading Workflow Editor ===');

document.addEventListener('DOMContentLoaded', async function() {
    console.log('=== Initializing Workflow Editor ===');

    const editorContainer = document.getElementById('workflow-editor-canvas');
    if (editorContainer) {
        try {
            const editor = new WorkflowEditor(editorContainer);
            await editor.initialize();

            // Make editor globally accessible for debugging
            window.workflowEditor = editor;

            console.log('=== Workflow Editor Initialized ===');
        } catch (error) {
            console.error('=== Failed to initialize Workflow Editor ===', error);
        }
    } else {
        console.error('=== Editor container not found ===');
    }
});
