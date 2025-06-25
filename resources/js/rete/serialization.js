export function serializeNodesForSave(editor) {
    const nodes = editor.getNodes();
    const connections = editor.getConnections();
    let output = "Status Flow Configuration\n";
    output += "======================\n\n";

    // Add nodes information
    output += "Nodes:\n";
    output += "------\n";
    nodes.forEach(node => {
        const data = node.data();
        output += `\nName: ${data.name}\n`;
        output += `Color: ${data.color}\n`;
        output += `Description: ${data.description || 'N/A'}\n`;
        output += `Condition: ${data.condition || 'N/A'}\n`;
        output += `Position: (${Math.round(node.position[0])}, ${Math.round(node.position[1])})\n`;
        output += `ID: ${node.id}\n`;
        output += "------------------------\n";
    });

    // Add connections information
    output += "\nConnections:\n";
    output += "-----------\n";
    connections.forEach(conn => {
        const sourceNode = nodes.find(n => n.id === conn.source);
        const targetNode = nodes.find(n => n.id === conn.target);
        output += `\nFrom: ${sourceNode ? sourceNode.data().name : 'Unknown'} (ID: ${conn.source})`;
        output += `\nTo: ${targetNode ? targetNode.data().name : 'Unknown'} (ID: ${conn.target})\n`;
        output += "------------------------\n";
    });

    // Add JSON representation at the bottom
    output += "\nJSON Data:\n";
    output += "-----------\n";
    const jsonData = {
        nodes: nodes.map(node => ({
            id: node.id,
            data: node.data(),
            position: {
                x: Math.round(node.position[0]),
                y: Math.round(node.position[1])
            }
        })),
        connections: connections.map(conn => ({
            id: conn.id,
            sourceNodeId: conn.source,
            targetNodeId: conn.target,
            sourceOutput: conn.sourceOutput,
            targetInput: conn.targetInput
        })),
        metadata: {
            exportedAt: new Date().toISOString(),
            totalNodes: nodes.length,
            totalConnections: connections.length
        }
    };

    output += JSON.stringify(jsonData, null, 2);
    return output;
}

export function downloadAsFile(content, filename) {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
}
