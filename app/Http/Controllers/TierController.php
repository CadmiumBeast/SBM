<?php

namespace App\Http\Controllers;

use App\Models\Tier;
use Illuminate\Http\Request;

class TierController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $tiers = Tier::all();
        return inertia('tiers/index', [
            'tiers' => $tiers,
        ]);
    }

    public function create()
    {
        return inertia('tiers/create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
        ]);

        Tier::create([
            'name' => $validated['name'],
        ]);
        return redirect()->route('tiers.index');
    }

    /**
     * Display the specified resource.
     */
    public function show(Tier $tier)
    {
        return inertia('tiers/show', [
            'tier' => $tier,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Tier $tier)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
        ]);

        $tier->update([
            'name' => $validated['name'],
        ]);
        return redirect()->route('tiers.index');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Tier $tier)
    {
        $tier->delete();
        return redirect()->route('tiers.index');
    }
}
