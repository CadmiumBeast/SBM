<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('leads', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('account_id')->nullable();
            $table->string('first_name');
            $table->string('last_name');
            $table->string('full_name');
            $table->longText('headline')->nullable();
            $table->string('job_title')->nullable();
            $table->string('location')->nullable();
            $table->string('work_email')->nullable();
            $table->integer('engagement_score')->nullable()->default(0);
            $table->integer('priority')->nullable()->default(0);
            $table->boolean('follow_company')->default(false);
            $table->timestamps();
            $table->foreign('account_id')->references('id')->on('accounts')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('leads');
    }
};
