<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Company;
use Illuminate\Http\Request;
use Inertia\Inertia;

class UserController extends Controller
{
    public function index()
    {
        $users = User::with('company')->get();
        $companies = Company::all();

        return Inertia::render('users/index', [
            'users' => $users,
            'companies' => $companies,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8',
            'type' => 'required|in:admin,agent',
            'company_id' => 'required_if:type,agent|nullable|exists:companies,id',
        ]);

        $validated['password'] = bcrypt($validated['password']);

        User::create($validated);

        return redirect()->route('users.index')->with('success', 'User created successfully');
    }

    public function update(Request $request, User $user)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $user->id,
            'type' => 'required|in:admin,agent',
            'company_id' => 'required_if:type,agent|nullable|exists:companies,id',
        ]);

        // Only update password if provided
        if ($request->filled('password')) {
            $request->validate([
                'password' => 'required|string|min:8',
            ]);
            $validated['password'] = bcrypt($request->password);
        }

        $user->update($validated);

        return redirect()->route('users.index')->with('success', 'User updated successfully');
    }

    public function destroy(User $user)
    {
        $user->delete();

        return redirect()->route('users.index')->with('success', 'User deleted successfully');
    }

    public function edit(User $user)
    {
        $companies = Company::all();

        return Inertia::render('users/edit', [
            'user' => $user,
            'companies' => $companies,
        ]);
    }

    public function create()
    {
        $companies = Company::all();

        return Inertia::render('users/create', [
            'companies' => $companies,
        ]);
    }
}
