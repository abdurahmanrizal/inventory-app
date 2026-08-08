<?php

namespace App\Http\Controllers;

use App\Enums\UserRole;
use App\Support\NotificationPresenter;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        return response()->json([
            'unread_count' => $user->unreadNotifications()->count(),
            'items' => $user->notifications()->latest()
                ->limit($user->role === UserRole::WarehouseManager ? 30 : 8)
                ->get()->map(fn ($notification) => NotificationPresenter::make($notification)),
        ])->header('Cache-Control', 'no-store, private');
    }

    public function read(Request $request, string $notification): RedirectResponse
    {
        $request->user()->notifications()->whereKey($notification)->firstOrFail()->markAsRead();

        return back();
    }

    public function readAll(Request $request): RedirectResponse
    {
        $request->user()->unreadNotifications()->update(['read_at' => now()]);

        return back();
    }
}
