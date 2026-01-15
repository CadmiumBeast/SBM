<?php

namespace App\Http\Controllers;

use App\Models\ContentCalender;
use App\Models\ContentFeedback;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redirect;

class ContentController extends Controller
{
    public function feedback(Request $request)
    {
        $data = $request->all();

        #mail logic to send feedback to content team
        \Mail::to('content-team@example.com')->send(new \App\Mail\ContentFeedbackMail());

        ContentFeedback::create([
            'content_calender_id' => $request->route('calendarId'),
            'user_id' => auth()->user()->id,
            'feedback' => $data['feedback'],
        ]);

        return response()->json(['message' => 'Feedback submitted successfully'], 201);
    }

    public function store(Request $request)
    {
        
        $validated = $request->validate([
            'company_id' => 'required|exists:companies,id',
            'date' => 'required|date',
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'content_link' => 'required|url|max:255',
            'type' => 'required|string|max:255',
        ]);

        ContentCalender::create($validated);

        return Redirect::back()->with('success', 'Content added successfully');
    }
}
