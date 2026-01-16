<?php

namespace App\Http\Controllers;

use App\Models\Account;
use App\Models\Company;
use App\Models\Lead;
use App\Models\Region;
use App\Models\Tier;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class ConnectionController extends Controller
{
    public function connectionSent(Request $request)
    {
        try{

            $data = $request->json()->all();
            
            $campaignName = $data['campaign']['name'];

            // Extract company, region, and tier from campaign name
            $companyName = explode(' ', trim($campaignName))[0];
            $regionName = explode(' ', trim($campaignName))[1];
            $tier = explode(' ', trim($campaignName))[3];
            $tierName = 'Tier '.$tier;

            $lead_headline = $data['summary'] ?? '';
            $lead_location = $data['location'] ?? '';
            $lead_job = $data['position'] ?? '';
            $lead_fullname = $data['full_Name'] ?? '';
            $lead_lastname = $data['last_Name'] ?? '';
            $lead_firstname = $data['first_Name'] ?? '';

            
        
            $lead = $this->findLead($lead_job, $lead_fullname,$lead_lastname,$lead_firstname, $companyName, $lead_location, $companyName, $regionName, $tierName);



            $lead_id = $lead->id;
            $sender = $data['sender']['full_name'] ?? '';
            $last_action_taken = 'Connection_Sent';
            $last_action_date = $data['sent_At'] ?? now();
            $senders_status = 'Connection_Sent';

            $last_action_date = Carbon::parse($last_action_date)->toDateTimeString();

            // Create or update connection record
            $connection = \App\Models\Connection::Create(
                [
                    'lead_id' => $lead_id,
                    'sender' => $sender,
                    'last_action_taken' => $last_action_taken,
                    'last_action_date' => $last_action_date,
                    'senders_status' => $senders_status,
                ]
            );


            return response()->json(['message' => 'Connection data processed successfully'], 200);



        }catch(\Exception $e){
            \Log::error('Error in connectionSent: '.$e->getMessage());
            return response()->json(['message' => 'Internal Server Error'], 500);
        }
        return response()->json(['message' => 'Connection data received successfully'], 200);
    }

    public function connectionAccepted(Request $request)
    {
        try{
            $data = $request->json()->all();
            
            $campaignName = $data['campaign']['name'];

            // Extract company, region, and tier from campaign name
            $companyName = explode(' ', trim($campaignName))[0];
            $regionName = explode(' ', trim($campaignName))[1];
            $tier = explode(' ', trim($campaignName))[3];
            $tierName = 'Tier '.$tier;

            $lead_headline = $data['summary'] ?? '';
            $lead_location = $data['location'] ?? '';
            $lead_job = $data['position'] ?? '';
            $lead_fullname = $data['full_Name'] ?? '';
            $lead_lastname = $data['last_Name'] ?? '';
            $lead_firstname = $data['first_Name'] ?? '';
            $company_name = $data['company_name'] ?? '';

            
        
            $lead = $this->findLead($lead_job, $lead_fullname,$lead_lastname,$lead_firstname, $company_name, $lead_location, $companyName, $regionName, $tierName);



            $lead_id = $lead->id;
            $sender = $data['sender']['full_name'] ?? '';
            $last_action_taken = 'Connection_Accepted';
            $last_action_date = $data['sent_At'] ?? now();
            $senders_status = 'Connection_Accepted';

            $last_action_date = Carbon::parse($last_action_date)->toDateTimeString();


            // Create or update connection record
            $connection = \App\Models\Connection::Create(
                [
                    'lead_id' => $lead_id,
                    'sender' => $sender,
                    'last_action_taken' => $last_action_taken,
                    'last_action_date' => $last_action_date,
                    'senders_status' => $senders_status,
                ]
            );

            


            return response()->json(['message' => 'Connection accepted data processed successfully'], 200);
        }
        catch(\Exception $e){
            \Log::error('Error in connectionAccepted: '.$e->getMessage());
            return response()->json(['message' => 'Internal Server Error'], 500);
        }
    }

    public function findLead($job, $FullName, $lastName, $firstName, $companyName, $location, $company, $regionname, $tierName)
    {
        $company_details = Company::where('name', $company)->first();
        if(!$company_details){
            $company_details = Company::create(['name' => $companyName]);
        }

        $tier = Tier::where('name', $tierName)->first();
        if(!$tier){
            $tier = Tier::create(['name' => $tierName]);
        }


        $region = Region::where('name', $regionname)->first();

        if(!$region){
            $region = Region::create([
                'name' => $regionname,
                'company_id' => $company->id,
                ]);
        }

        $Account = Account::where('name', $companyName)
                    ->where('company_id', $company_details->id)
                    ->where('region_id', $region->id)
                    ->where('tier_id', $tier->id)
                    ->first();

        if(!$Account){
            $Account = Account::create([
                'name' => $companyName,
                'domain' => strtolower(str_replace(' ', '', $companyName)).'.com',
                'visibility_score' => 0,
                'company_id' => $company_details->id,
                'tier_id' => $tier->id,
                'region_id' => $region->id,
            ]);
        }

        $lead = Lead::where('full_name', $FullName)
                ->where('job_title', $job)
                ->where('account_id', $Account->id)
                ->first();

        if(!$lead){
            $lead = Lead::create([
                'full_name' => $FullName,
                'first_name' => $firstName,
                'last_name' => $lastName,
                'job_title' => $job,
                'location' => $location,
                'account_id' => $Account->id,
            ]);
        }

        return $lead;
    }

}
