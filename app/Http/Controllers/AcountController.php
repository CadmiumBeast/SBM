<?php

namespace App\Http\Controllers;
use App\Models\Lead;
use Illuminate\Container\Attributes\Log;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
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
        $accounts = \App\Models\Account::all();
        $leads = \App\Models\Lead::all();
        $company = \App\Models\Company::all();
        $regions = \App\Models\Region::all();
        $tiers = \App\Models\Tier::all();

        return Inertia::render('accounts/index', [
            'accounts' => $accounts,
            'leads' => $leads,
            'companies' => $company,    
            'regions' => $regions,
            'tiers' => $tiers,
        ]); 
    }

    public function import(Request $request){
        try{
           $validator = Validator::make($request->all(), [
                'csv_headers' => 'required|array',
                'csv_rows' => 'required|array',
                'column_mapping' => 'required|array',
                'company_id' => 'nullable|exists:App\Models\Company,id', 
                'tier_id' => 'nullable|exists:App\Models\Tier,id',
                'region_id' => 'nullable|exists:App\Models\Region,id',

            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid data provided',
                    'errors' => $validator->errors()
                ], 400);
            }


            $columnMapping = $request->input('column_mapping');
            $customFields = $request->input('custom_fields', []);
            $companyId = $request->input('company_id');
            $regionId = $request->input('region_id');
            $tierId = $request->input('tier_id');
            $csvData = [
                'headers' => $request->input('csv_headers'),
                'rows' => $request->input('csv_rows'),
            ];

            $importedCount = 0;
            $errors = [];

            foreach ($csvData['rows'] as $rowIndex => $row) {
                try {
                    $leadData = [];
                    $accountData = [];
                    $customFieldData = [];

                    foreach ($columnMapping as $csvColumn => $dbColumn) {
                        if ($dbColumn === 'skip') continue;

                        $columnIndex = array_search($csvColumn, $csvData['headers']);
                        if ($columnIndex === false) continue;

                        $value = $row[$columnIndex] ?? null;
                        if (empty($value)) continue;

                        // SAFETY CHECK: Prevent overwriting MongoDB internal _id
                        if ($dbColumn === 'id' || $dbColumn === '_id') continue;

                        // Account-specific fields
                        if (in_array($dbColumn, ['company', 'company_domain'])) {
                            $accountData[$dbColumn] = $value;
                        } elseif (strpos($dbColumn, 'custom_') === 0) {
                            $customFieldId = str_replace('custom_', '', $dbColumn);
                            $customField = collect($customFields)->firstWhere('id', $customFieldId);
                            
                            if ($customField) {
                                $customFieldData[$customField['name']] = $this->castValue($value, $customField['type']);
                            }
                        } else {
                            $leadData[$dbColumn] = $value;
                        }
                    }

                    // Create or update Account
                    $accountName = $accountData['company'] ?? 'Unknown Company';
                    $accountDomain = $accountData['company_domain'] ?? strtolower(str_replace(' ', '-', $accountName));
                    
                    $account = \App\Models\Account::firstOrCreate(
                        ['name' => $accountName, 'company_id' => $companyId],
                        [
                            'domain' => $accountDomain,
                            'company_id' => $companyId,
                            'tier_id' => $tierId,
                            'region_id' => $regionId,
                        ]
                    );

                    // Create Lead
                    $lead = new Lead();
                    $lead->fill($leadData);
                    $lead->account_id = $account->id;
                    
                    if (!empty($customFieldData)) {
                        $lead->custom_fields = $customFieldData;
                    }
                    
                    $lead->save();
                    $importedCount++;

                } catch (\Exception $e) {
                    $errors[] = "Row " . ($rowIndex + 2) . ": " . $e->getMessage();
                    // Optional: Log fewer details to save IO if imports are huge
                }
            }

            return response()->json([
                'success' => true,
                'message' => "Successfully imported {$importedCount} leads" . 
                             (count($errors) > 0 ? " with " . count($errors) . " errors" : ""),
                'imported_count' => $importedCount,
                'errors' => $errors
            ]);

            
 

        }catch(\Exception $e){
            Log::error('Error importing accounts: '.$e->getMessage());     
            return response()->json(['message' => 'Internal Server Error'], 500);
        }
    }

}
