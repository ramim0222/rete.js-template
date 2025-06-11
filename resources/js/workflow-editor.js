// import { WorkflowEditor } from './workflow-editor/WorkflowEditor.js';

// // Initialize the editor when DOM is loaded
// document.addEventListener('DOMContentLoaded', function() {
//     const editorContainer = document.getElementById('workflow-editor');
//     if (editorContainer) {
//         const editor = new WorkflowEditor(editorContainer);
//         editor.initialize();

//         // Make editor globally accessible for debugging
//         window.workflowEditor = editor;
//     }
// });

// Import required dependencies
import Alpine from 'alpinejs';

// Define the workflow editor component
document.addEventListener('alpine:init', () => {
    Alpine.data('workflowEditor', () => ({
        initialized: false,

        init() {
            if (this.initialized) return;
            this.initialized = true;

            console.log('=== Workflow Editor Initializing ===');
            this.setupEditor();
        },

        setupEditor() {
            try {
                console.log('=== Setting up Workflow Editor ===');

                // Add test content to verify the component is working
                this.$el.innerHTML = `
                    <div style="padding: 40px; text-align: center; background: #f3f4f6; height: 100%; display: flex; flex-direction: column; justify-content: center; align-items: center;">
                        <h3 style="color: #1f2937; margin-bottom: 20px;">✅ Workflow Editor Container Found!</h3>
                        <p style="color: #6b7280; margin-bottom: 30px;">JavaScript is working correctly</p>
                        <div style="width: 120px; height: 120px; background: linear-gradient(135deg, #3B82F6, #1D4ED8); margin: 0 auto; border-radius: 12px; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                            TEST NODE
                        </div>
                        <p style="color: #6b7280; margin-top: 20px; font-size: 14px;">Ready for Rete.js integration</p>
                    </div>
                `;

                console.log('=== Test content added successfully ===');
            } catch (error) {
                console.error('Error setting up workflow editor:', error);
            }
        }
    }));
});

console.log('=== Workflow Editor Script Loaded ===');
