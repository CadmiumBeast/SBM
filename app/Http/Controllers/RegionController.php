<?php

namespace App\Http\Controllers;

use App\Models\Company;
use App\Models\Region;
use Illuminate\Http\Request;
use Inertia\Inertia;

class RegionController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $regions = Region::all();
        return Inertia::render('regions/index', [
            'regions' => $regions,
        ]);
    }

    public function create()
    {
        $companies = Company::all();
        return Inertia::render('regions/create', [
            'companies' => $companies,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'company_id' => 'required|exists:companies,id',
        ]);

        Region::create([
            'name' => $validated['name'],
            'company_id' => $validated['company_id'],
        ]);
        return redirect()->route('regions.index');
    }

    /**
     * Display the specified resource.
     */
    public function show(Region $region)
    {
        $company = $region->company;
        return Inertia::render('regions/show', [
            'region' => $region,
            'company' => $company,
        ]);
    }

    public function edit(Region $region)
    {
        $companies = Company::all();
        return Inertia::render('regions/edit', [
            'region' => $region,
            'companies' => $companies,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Region $region)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'company_id' => 'required|exists:companies,id',
        ]);

        $region->update([
            'name' => $validated['name'],
            'company_id' => $validated['company_id'],
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Region $region)
    {
        $region->delete();
        return redirect()->route('regions.index');
    }
}
