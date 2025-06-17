<div wire:ignore>

    <style>

    .drawer-input {
        width: 100%;
        padding: 5px;
        margin-bottom: 10px;
    }

    </style>

<script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>

    <!-- Drawer -->
<div id="nodeDrawer" style="position: fixed; top: 0; right:-500px;  width: 400px; height: 100%; background: #fff; box-shadow: -2px 0 10px rgba(0,0,0,0.3); transition: right 0.3s; padding: 20px; z-index: 9999;">
    <h3>Create Node</h3>
    <label>Name</label>
    <input type="text" id="nodeName" class="drawer-input w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Enter Status Name" /><br/><br/>

    <label>Color (hex)</label>
    <input type="text" id="nodeColor" class="drawer-input w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="#aabbcc"  /><br/><br/>

    <label>Description</label>
    <textarea id="nodeDesc" rows="4" class="drawer-input w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Enter Description"></textarea><br/><br/>

    <label>Select Condition</label>
    <select id="nodeCondition" class="drawer-input w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
        <option value="equals">Equals</option>
        <option value="not_equals">Not Equals</option>
        <option value="greater_than">Greater Than</option>
        <option value="less_than">Less Than</option>
    </select>

    <button onclick="submitNodeForm()" class="px-6 py-2 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2">Create Node</button>
    <button onclick="closeDrawer()" class="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2">Close</button>
</div>

<script>
    let drawerCallback = null;
    window.submitNodeForm = submitNodeForm;
    // window.closeDrawer = closeDrawer;


function submitNodeForm() {
    const name = document.getElementById('nodeName').value;
    const color = document.getElementById('nodeColor').value;
    const description = document.getElementById('nodeDesc').value;
    const condition = document.getElementById('nodeCondition').value;

    if (drawerCallback) drawerCallback({ name, color, description, condition });
    closeDrawer();
}

    function closeDrawer() {
        document.getElementById('nodeDrawer').style.right = '-500px';
        drawerCallback = null;
    }
</script>


<div id="info" style="text-align: center">Drag the unconnected node onto the connection between nodes</div>
<div id="editor" wire:ignore"></div>


@vite('resources/js/rete/main.js')


</div>
