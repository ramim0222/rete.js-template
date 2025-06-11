import { WorkflowEditor } from './workflow-editor/WorkflowEditor.js';

// Initialize the editor when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    const editorContainer = document.getElementById('workflow-editor');
    if (editorContainer) {
        const editor = new WorkflowEditor(editorContainer);
        editor.initialize();

        // Make editor globally accessible for debugging
        window.workflowEditor = editor;
    }
});