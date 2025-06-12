@push('styles')
<style>
    .workflow-editor-canvas {
        position: relative;
        overflow: hidden;
        background-size: 20px 20px;
        background-image:
            linear-gradient(to right, #f1f1f1 1px, transparent 1px),
            linear-gradient(to bottom, #f1f1f1 1px, transparent 1px);
    }

    .node {
        background: white !important;
        border: 1px solid #ccc !important;
        border-radius: 8px !important;
        cursor: pointer !important;
        min-width: 180px !important;
        height: auto !important;
        padding: 12px !important;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1) !important;
    }

    .node:hover {
        box-shadow: 0 4px 8px rgba(0,0,0,0.15) !important;
    }

    .node .input,
    .node .output {
        margin: 4px 0 !important;
    }

    .connection {
        stroke: #6b7280 !important;
        stroke-width: 2px !important;
    }

    .connection.selected {
        stroke: #3b82f6 !important;
        stroke-width: 3px !important;
    }
</style>
@endpush

<div id="workflow-editor-container" class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Header -->
        <div class="mb-8">
            <h1 class="text-3xl font-bold text-gray-900">Workflow Editor</h1>
            <p class="mt-2 text-gray-600">Design your custom approval workflow by adding statuses and connecting them.</p>

            @if (session()->has('message'))
                <div class="mt-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                    {{ session('message') }}
                </div>
            @endif
        </div>

        <!-- Toolbar -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
            <div class="flex items-center justify-between">
                <div class="flex items-center space-x-4">
                    <button id="save-workflow" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium">
                        Save Workflow
                    </button>
                    <button id="reset-workflow" class="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium">
                        Reset
                    </button>
                </div>
                <div class="text-sm text-gray-500">
                    Right-click on canvas to add new status
                </div>
            </div>
        </div>

        <!-- Editor Canvas -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200" style="height: 600px;">
            <div
                id="workflow-editor-canvas"
                class="workflow-editor-canvas w-full h-full rounded-lg"
                data-statuses="{{ json_encode($statuses) }}"
                data-transitions="{{ json_encode($transitions) }}"
            ></div>
        </div>

        <!-- Properties Panel (Initially Hidden) -->
        <div id="properties-panel" class="hidden fixed right-4 top-1/2 transform -translate-y-1/2 bg-white rounded-lg shadow-lg border border-gray-200 w-80 z-50">
            <div class="p-4 border-b border-gray-200">
                <h3 class="text-lg font-semibold text-gray-900" id="panel-title">Status Properties</h3>
            </div>
            <div class="p-4 space-y-4" id="panel-content">
                <!-- Dynamic content will be inserted here -->
            </div>
            <div class="p-4 border-t border-gray-200">
                <div class="flex justify-end space-x-2">
                    <button id="cancel-properties" class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md">
                        Cancel
                    </button>
                    <button id="save-properties" class="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md">
                        Save
                    </button>
                </div>
            </div>
        </div>
    </div>
</div>

@push('scripts')
    @vite('resources/js/workflow-editor.js')
@endpush
