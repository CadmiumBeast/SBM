<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

//Heyreach API Routes can be added here
Route::post('/connections/connection-sent', [\App\Http\Controllers\ConnectionController::class, 'connectionSent']);
Route::post('/connections/connection-accepted', [\App\Http\Controllers\ConnectionController::class, 'connectionAccepted']);

//Smartlead API Routes
Route::post('/email/sent', [\App\Http\Controllers\EmailController::class, 'emailSent']);
Route::post('/email/opened', [\App\Http\Controllers\EmailController::class, 'emailOpened']);
Route::post('/email/clicked', [\App\Http\Controllers\EmailController::class, 'clickedOnLink']);
