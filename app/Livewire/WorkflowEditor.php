<?php

namespace App\Livewire;

use Livewire\Component;
use App\Models\Status;
use App\Models\Transition;

class WorkflowEditor extends Component
{
    public $statuses = [];
    public $transitions = [];

    public function mount()
    {
        $this->loadWorkflowData();
    }

    public function loadWorkflowData()
    {
        $this->statuses = Status::all()->toArray();
        $this->transitions = Transition::with(['fromStatus', 'toStatus'])->get()->toArray();
    }

    public function saveWorkflow($workflowData)
    {
        // We'll implement this later - for now just log
        logger('Workflow saved:', $workflowData);

        session()->flash('message', 'Workflow saved successfully!');
    }

    public function render()
    {
        return view('livewire.workflow-editor');
    }
}
