<?php

namespace App\Livewire;

use Livewire\Component;
use App\Models\Status;

class ReteEditor extends Component
{
    protected $listeners = ['saveTransactionNode'];

    public function render()
    {
        return view('livewire.rete-editor');
    }

    public function saveTransactionNode($data)
    {
        \Log::info('Incoming saveTransactionNode data:', $data);

        Status::create([
            'name' => $data['name'] ?? 'Unnamed',
            'position_x' => $data['x'] ?? 0,
            'position_y' => $data['y'] ?? 0,
        ]);
    }

    public function saveState($data)
    {
        \Log::info('Received Rete.js state:', $data);
    }
}
