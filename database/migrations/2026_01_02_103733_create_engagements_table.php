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
        Schema::create('engagements', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('company_id');
            $table->timestamp('start_date')->nullable();
            $table->timestamp('end_date')->nullable();
            $table->integer('page_posts')->default(0);
            $table->integer('impressions')->default(0);
            $table->integer('reactions')->default(0);
            $table->integer('comments')->default(0);
            $table->integer('reposts')->default(0);
            $table->integer('engagement')->default(0);
            $table->integer('linkedin_page_views')->default(0);
            $table->integer('linkedin_unique_visitors')->default(0);
            $table->integer('company_followers')->default(0);
            $table->integer('search_appearance_product')->default(0);
            $table->integer('search_appearance_contact_us')->default(0);
            $table->integer('newsletter_subscriptions')->default(0);
            $table->integer('newsletter_articles')->default(0);
            $table->json('profile_followers')->nullable();
            $table->timestamps();

            $table->foreign('company_id')->references('id')->on('companies')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('engagements');
    }
};
