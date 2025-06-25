import { ClassicPreset } from "rete";

const socket = new ClassicPreset.Socket("socket");

export class Node extends ClassicPreset.Node {
    constructor(name = "Status Name", color = "#aabbcc", description = "", condition = "equals") {
        super(String(name || "Status Name"));
        this.style = { backgroundColor: color, color: 'white' };
        this.width = 'auto';
        this.height = 'auto';
        this.label = String(name || "Status Name");
        this.isNewNode = true;

        this.addInput("port", new ClassicPreset.Input(socket));
        this.addOutput("port", new ClassicPreset.Output(socket));

        this.addControl("name", new ClassicPreset.InputControl("text", { initial: String(name || "Status Name") }));
        this.addControl("color", new ClassicPreset.InputControl("text", { initial: color }));
        this.addControl("description", new ClassicPreset.InputControl("text", { initial: description }));
        this.addControl("condition", new ClassicPreset.InputControl("text", { initial: condition }));
    }

    data() {
        return {
            name: String(this.controls.name.value || "Status Name"),
            color: this.controls.color.value,
            description: this.controls.description.value,
            condition: this.controls.condition.value
        };
    }
}

export { socket };
