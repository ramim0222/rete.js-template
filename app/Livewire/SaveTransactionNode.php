<?php

namespace App\Livewire;

use Livewire\Component;

class SaveTransactionNode extends Component
{
    protected $listeners = ['saveTransactionNode'];

    public function saveTransactionNode($data)
    {
        App\Models\Status::create([
            'name' => $data['name'],
            'position_x' => $data['x'],
            'position_y' => $data['y'],
        ]);
    }

    public function render()
    {
        return view('livewire.save-transaction-node');
    }
}
