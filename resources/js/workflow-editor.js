import { WorkflowEditor } from './workflow-editor/WorkflowEditor.js';

console.log('=== Loading Workflow Editor ===');

document.addEventListener('DOMContentLoaded', function() {
    console.log('=== Initializing Workflow Editor ===');

    const editorContainer = document.getElementById('workflow-editor');
    if (editorContainer) {
        const editor = new WorkflowEditor(editorContainer);
        editor.init();

        // Make editor globally accessible for debugging
        window.workflowEditor = editor;

        console.log('=== Workflow Editor Initialized ===');
    } else {
        console.error('=== Editor container not found ===');
    }
});
