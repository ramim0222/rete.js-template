<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Order extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'description',
        'total_amount',
        'current_status_id',
        'created_by',
        'metadata'
    ];

    protected $casts = [
        'metadata' => 'array',
        'total_amount' => 'decimal:2'
    ];

    public function currentStatus()
    {
        return $this->belongsTo(Status::class, 'current_status_id');
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
