<?php

namespace App\Observers;

use App\Models\Connection;

class ConnectionObserver
{
    /**
     * Handle the Connection "updated" event.
     */
    public function updated(Connection $connection): void
    {
        // Check if sender_status changed to 'connected'
        if (!$connection->isDirty('senders_status')) {
            return;
        }

        if (!$connection->lead) {
            return;
        }

        $previousStatus = $connection->getOriginal('senders_status');
        $newStatus = $connection->senders_status;

        // Only award points when status becomes 'connected'
        if ($newStatus === 'connected' && $previousStatus !== 'connected') {
            $connection->lead->increment('engagement_score', 10); // 10 points for connection
        }
    }
}
