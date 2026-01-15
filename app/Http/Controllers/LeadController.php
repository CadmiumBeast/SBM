<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class LeadController extends Controller
{
/**
     * Display a listing of the resource.
     */
    public function index()
    {
        $leads = \App\Models\Lead::all();
        return response()->json(['leads' => $leads], 200);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $data = $request->all();

        //Check if lead with same email exists
        $exist = $this->checkLeadExists($request);
        if ($exist->getData()->exists) {
            return response()->json(['message' => 'Lead already exists'], 409);
        }else{
            // Create new lead
            $lead = \App\Models\Lead::create($data);
            return response()->json(['message' => 'Lead created successfully', 'lead' => $lead], 201);
        }
    }

    //check if lead exists
    public function checkLeadExists(Request $request)
    {
        $email = $request->input('email');
        $fname = $request->input('first_name');
        $lname = $request->input('last_name');
        $fullname = $request->input('full_name') ?? $fname . ' ' . $lname;

        // Assuming you have a User model to check against
        $exists = \App\Models\Lead::where('email', $email)
            ->orWhere(function($query) use ($fname, $lname) {
                $query->where('first_name', $fname)
                      ->where('last_name', $lname);
            })
            ->orWhere('full_name', $fullname)
            ->exists();
        
        return response()->json(['exists' => $exists]);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
