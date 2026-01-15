<?php

namespace App\Http\Controllers;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AcountController extends Controller
{
    public function store(Request $request)
    {
        $data = $request->all();

        //Check if account with same name and company_id exists
        $exist = $this->checkAcountExists($request);
        if ($exist->getData()->exists) {
            return response()->json(['message' => 'Account already exists'], 409);
        }else{
            // Create new account
            $account = \App\Models\Account::create($data);
            return response()->json(['message' => 'Account created successfully', 'account' => $account], 201);
        }
    }

    //check if acount exists
    public function checkAcountExists(Request $request)
    {
        $name = $request->input('name');
        $company_id = $request->input('company_id');

        // Assuming you have a User model to check against
        $exists = \App\Models\Account::where('name', $name)
            ->where('company_id', $company_id)
            ->exists();

        return response()->json(['exists' => $exists]);
    }

    public function index(Request $request)
    {
        $company_id = $request->input('company_id');

        $accounts = \App\Models\Account::where('company_id', $company_id)->get();

        return Inertia::render('accounts/index', [
            'accounts' => $accounts,
        ]); 
    }
}
