<?php

namespace App\Http\Controllers;

use App\Models\Company;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CompanyController extends Controller
{
    public function index()
    {
        $companies = Company::all();

        return Inertia::render('companies/index', [
            'companies' => $companies,
        ]);
    }

    public function show(Company $company)
    {
        return Inertia::render('companies/show', [
            'company' => $company,
        ]);
    }

    public function create()
    {
        return Inertia::render('companies/create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
        ]);

        Company::create([
            'name' => $validated['name'],
        ]);

        return redirect()->route('companies.index');
    }

    public function edit(Company $company)
    {
        return Inertia::render('companies/edit', [
            'company' => $company,
        ]);
    }

    public function update(Request $request, Company $company)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
        ]);

        $company->update([
            'name' => $validated['name'],
        ]);

        return redirect()->route('companies.index');
    }

    public function destroy(Company $company)
    {
        
        $company->delete();

        return redirect()->route('companies.index');
    }
}
