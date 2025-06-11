<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Transition extends Model
{
    use HasFactory;

    protected $fillable = [
        'from_status_id',
        'to_status_id',
        'condition_expression'
    ];

    public function fromStatus()
    {
        return $this->belongsTo(Status::class, 'from_status_id');
    }

    public function toStatus()
    {
        return $this->belongsTo(Status::class, 'to_status_id');
    }
}
