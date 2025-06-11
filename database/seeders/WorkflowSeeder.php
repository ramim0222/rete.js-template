<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Status;
use App\Models\Transition;
use App\Models\User;

class WorkflowSeeder extends Seeder
{
    public function run()
    {
        // Create sample statuses
        $requested = Status::create([
            'name' => 'Requested',
            'description' => 'Initial request submitted',
            'color_code' => '#EF4444',
            'allowed_roles' => json_encode(['user', 'admin']), // Fix: encode as JSON
            'position_x' => 100,
            'position_y' => 100
        ]);

        $reviewed = Status::create([
            'name' => 'Under Review',
            'description' => 'Request is being reviewed',
            'color_code' => '#F59E0B',
            'allowed_roles' => json_encode(['manager', 'admin']), // Fix: encode as JSON
            'position_x' => 300,
            'position_y' => 100
        ]);

        $approved = Status::create([
            'name' => 'Approved',
            'description' => 'Request has been approved',
            'color_code' => '#10B981',
            'allowed_roles' => json_encode(['manager', 'admin']), // Fix: encode as JSON
            'position_x' => 500,
            'position_y' => 100
        ]);

        // Create transitions
        Transition::create([
            'from_status_id' => $requested->id,
            'to_status_id' => $reviewed->id
        ]);

        Transition::create([
            'from_status_id' => $reviewed->id,
            'to_status_id' => $approved->id
        ]);

        // Create admin user
        User::create([
            'name' => 'Admin User',
            'email' => 'admin@example.com',
            'password' => bcrypt('password'),
            'role' => 'admin'
        ]);
    }
}
