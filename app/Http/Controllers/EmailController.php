<?php

namespace App\Http\Controllers;

use App\Models\Campaign;
use App\Models\Email;
use Illuminate\Http\Request;
use App\Models\Account;
use App\Models\Company;
use App\Models\Lead;
use App\Models\Region;
use App\Models\Tier;

class EmailController extends Controller
{
    public function emailSent(Request $request)
    {
        try{
            $data = $request->json()->all();

            $campaignName = $data['campaign_name'];

            // Extract company, region, and tier from campaign name
            $companyName = explode(' ', trim($campaignName))[0];
            $regionName = explode(' ', trim($campaignName))[1];
            $tier = explode(' ', trim($campaignName))[3];
            $tierName = 'Tier '.$tier;
            $campaignName = explode(' ', trim($campaignName))[4];

            $lead_fullname = $data['to_name'] ?? '';
            $lead_email = $data['to_email'] ?? '';

            [$lead, $campaign] = $this->findLead($lead_fullname, $lead_email, $companyName, $regionName, $tierName, $campaignName);
            $lead_id = $lead->id;
            $sequence_number = $data['sequence_number'] ?? 0;
            $sent_time = $data['time_sent'] ?? now();
            $sent_from = $data['subject'] ?? '';
            $is_subscribed = $data['is_subscribed'] ?? false;

            //Check if it already exists
            $email = Email::where('lead_id', $lead_id)
                    ->where('campaign_id', $campaign->id)
                    ->first();

            if($email){
                //Update existing record
                $email->sent_time = $sent_time;
                $email->sequence_number = $sequence_number;
                $email->sent_email = $sent_from;
                $email->is_subscribed = $is_subscribed;
                $email->save();
            }else{ 
                $email = Email::create([
                    'lead_id' => $lead_id,
                    'campaign_id' => $campaign->id,
                    'sequence_number' => $sequence_number,
                    'sent_time' => $sent_time,
                    'sent_email' => $sent_from,
                    'is_subscribed' => $is_subscribed,
                ]);
            }

            return response()->json(['message' => 'Email data processed successfully'], 200);

        }
        catch(\Exception $e){
            \Log::error('Error in emailSent: '.$e->getMessage());
            return response()->json(['message' => 'Internal Server Error'], 500);
        }

    }

    public function clickedOnLink(Request $request)
    {
        try{
            $data = $request->json()->all();

            $campaignName = $data['campaign_name'];

            // Extract company, region, and tier from campaign name
            $companyName = explode(' ', trim($campaignName))[0];
            $regionName = explode(' ', trim($campaignName))[1];
            $tier = explode(' ', trim($campaignName))[3];
            $tierName = 'Tier '.$tier;
            $campaignName = explode(' ', trim($campaignName))[4];

            $lead_fullname = $data['to_name'] ?? '';
            $lead_email = $data['to_email'] ?? '';

            [$lead, $campaign] = $this->findLead($lead_fullname, $lead_email, $companyName, $regionName, $tierName, $campaignName);
            $lead_id = $lead->id;
            $sequence_number = $data['sequence_number'] ?? 0;
            $time_clicked = $data['time_clicked'] ?? now();
            $sent_from = $data['subject'] ?? '';
            $is_subscribed = $data['is_subscribed'] ?? false;

            //Check if it already exists
            $email = Email::where('lead_id', $lead_id)
                    ->where('campaign_id', $campaign->id)
                    ->first();

            if($email){
                //Update existing record
                $email->clicked_time = $time_clicked;
                $email->sequence_number = $sequence_number;
                $email->sent_email = $sent_from;
                $email->is_unsubscribed = $is_subscribed;
                $email->click_count = $email->click_count + 1;
                $email->save();
            }else{ 
                $email = Email::create([
                    'lead_id' => $lead_id,
                    'campaign_id' => $campaign->id,
                    'sequence_number' => $sequence_number,
                    'clicked_time' => $time_clicked,
                    'click_count' => 1,
                    'sent_email' => $sent_from,
                    'is_unsubscribed' => $is_subscribed,
                ]);
            }

            return response()->json(['message' => 'Email data processed successfully'], 200);

        }
        catch(\Exception $e){
            \Log::error('Error in emailSent: '.$e->getMessage());
            return response()->json(['message' => 'Internal Server Error'], 500);
        }

    }

    public function emailOpened(Request $request)
    {
        try{
            $data = $request->json()->all();

            $campaignName = $data['campaign_name'];

            // Extract company, region, and tier from campaign name
            $companyName = explode(' ', trim($campaignName))[0];
            $regionName = explode(' ', trim($campaignName))[1];
            $tier = explode(' ', trim($campaignName))[3];
            $tierName = 'Tier '.$tier;
            $campaign = explode(' ', trim($campaignName))[4];

            $lead_fullname = $data['to_name'] ?? '';
            $lead_email = $data['to_email'] ?? '';

            [$lead, $campaign] = $this->findLead($lead_fullname, $lead_email, $companyName, $regionName, $tierName, $campaign);
            
            $lead_id = $lead->id;
            $sequence_number = $data['sequence_number'] ?? 0;
            $opened_time = $data['time_opened'] ?? now();
            $sent_from = $data['from_email'] ?? '';
            $is_subscribed = $data['is_subscribed'] ?? false;

            //Check if it already exists
            $email = Email::where('lead_id', $lead_id)
                    ->where('campaign_id', $campaign->id)
                    ->first();

            if($email){
                $email->opened_time = $opened_time;
                $email->open_count = $email->open_count + 1;
                $email->save();
            }else{
                $email = Email::create([
                    'lead_id' => $lead_id,
                    'campaign_id' => $campaign->id,
                    'sequence_number' => $sequence_number,
                    'sent_email' => $sent_from,
                    'is_subscribed' => $is_subscribed,
                    'opened_time' => $opened_time,
                    'open_count' => 1,
                ]);
            }

            

            return response()->json(['message' => 'Email data processed successfully'], 200);

        }
        catch(\Exception $e){
            \Log::error('Error in emailSent: '.$e->getMessage());
            return response()->json(['message' => 'Internal Server Error'], 500);
        }

    }

    public function emailReplied(Request $request)
    {
        try{
            $data = $request->json()->all();

            $campaignName = $data['campaign_name'];

            // Extract company, region, and tier from campaign name
            $companyName = explode(' ', trim($campaignName))[0];
            $regionName = explode(' ', trim($campaignName))[1];
            $tier = explode(' ', trim($campaignName))[3];
            $tierName = 'Tier '.$tier;
            $campaign = explode(' ', trim($campaignName))[4];

            $lead_fullname = $data['to_name'] ?? '';
            $lead_email = $data['to_email'] ?? '';

            [$lead, $campaign] = $this->findLead($lead_fullname, $lead_email, $companyName, $regionName, $tierName, $campaign);
            
            $lead_id = $lead->id;
            $sequence_number = $data['sequence_number'] ?? 0;
            $replied_time = $data['time_replied'] ?? now();
            $replied_message = $data['reply_message'] ?? '';
            $is_subscribed = $data['is_subscribed'] ?? false;

            //Check if it already exists
            $email = Email::where('lead_id', $lead_id)
                    ->where('campaign_id', $campaign->id)
                    ->first();

            if($email){
                $email->replied_time = $replied_time;
                $email->replied_message = $replied_message;
                $email->save();
            }else{
                $email = Email::create([
                    'lead_id' => $lead_id,
                    'campaign_id' => $campaign->id,
                    'sequence_number' => $sequence_number,
                    'replied_message' => $replied_message,
                    'is_subscribed' => $is_subscribed,
                    'replied_time' => $replied_time,
                ]);
            }

            

            return response()->json(['message' => 'Email data processed successfully'], 200);

        }
        catch(\Exception $e){
            \Log::error('Error in emailSent: '.$e->getMessage());
            return response()->json(['message' => 'Internal Server Error'], 500);
        }

    }

    public function findLead($FullName, $email, $companyName, $regionname, $tierName, $campaignname)
    {
        $company = Company::where('name', $companyName)->first();
        if(!$company){
            $company = Company::create(['name' => $companyName]);
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

        $campaign = Campaign::where('name', $campaignname)->where('company_id', $company->id)
                    ->where('region_id', $region->id)
                    ->first();

        if(!$campaign){
            $campaign = Campaign::create([
                'name' => $campaignname,
                'company_id' => $company->id,
                'region_id' => $region->id,
                'type' => 'Email',
            ]);
        }

        $Account = Account::where('name', $companyName)
                    ->where('company_id', $company->id)
                    ->where('region_id', $region->id)
                    ->where('tier_id', $tier->id)
                    ->first();

        if(!$Account){
            $Account = null;
        }

        $lead = Lead::where('full_name', $FullName)
                ->where('work_email', $email)
                ->first();

        if(!$lead){
            $lead = Lead::create([
                'full_name' => $FullName,
                'work_email' => $email,
                'first_name' => explode(' ', $FullName)[0],
                'last_name' => explode(' ', $FullName)[1] ?? '',
                'account_id' => $Account ? $Account->id : null,
            ]);
        }

        return [$lead, $campaign];
    }
}
