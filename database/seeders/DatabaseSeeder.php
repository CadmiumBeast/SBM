<?php

namespace Database\Seeders;

use App\Models\Company;
use App\Models\Region;
use App\Models\Tier;
use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        User::firstOrCreate(
            ['email' => 'admin@codax.online'],
            [
                'name' => 'admin',
                'password' => 'Cod@x3101',
                'email_verified_at' => now(),
                'type' => 'admin',
            ]
        );

        Company::firstOrCreate(
            ['name' => 'Scybers'],
            []
        );

        Region::firstOrCreate(
            ['name' => 'USA'],
            [
                'company_id' => Company::where('name', 'Scybers')->first()->id,
            ]
        );

        Tier::firstOrCreate(
            ['name' => 'Tier 1'],
            []
        );
    }
}
