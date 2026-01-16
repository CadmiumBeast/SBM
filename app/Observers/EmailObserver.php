<?php

namespace App\Observers;

use App\Models\Email;
use App\Models\Lead;

class EmailObserver
{
    /**
     * Handle the Email "updated" event.
     */
    public function updated(Email $email): void
    {
        // Check if open_count or click_count changed
        if (!$email->isDirty('open_count') && !$email->isDirty('click_count')) {
            return;
        }

        if (!$email->lead) {
            return;
        }

        // Calculate score changes
        $scoreChange = 0;

        // Check open_count changes: each open = 1 point
        if ($email->isDirty('open_count')) {
            $previousOpenCount = $email->getOriginal('open_count') ?? 0;
            $currentOpenCount = $email->open_count ?? 0;
            $openDifference = $currentOpenCount - $previousOpenCount;
            
            if ($openDifference > 0) {
                $scoreChange += $openDifference * 1; // 1 point per open
            }
        }

        // Check click_count changes: each click = 2 points
        if ($email->isDirty('click_count')) {
            $previousClickCount = $email->getOriginal('click_count') ?? 0;
            $currentClickCount = $email->click_count ?? 0;
            $clickDifference = $currentClickCount - $previousClickCount;
            
            if ($clickDifference > 0) {
                $scoreChange += $clickDifference * 2; // 2 points per click
            }
        }

        // Update lead's engagement score
        if ($scoreChange > 0) {
            $email->lead->increment('engagement_score', $scoreChange);
        }
    }
}
