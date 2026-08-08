<?php

namespace App\Http\Middleware;

use App\Enums\UserRole;
use App\Support\NotificationPresenter;
use App\Support\PendingApprovalStats;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Vite;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        // The dev server serves assets through HMR, so a production manifest
        // left on disk must not trigger an Inertia asset-version conflict.
        if (Vite::isRunningHot()) {
            return null;
        }

        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();

        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'auth' => [
                'user' => $user,
                'permissions' => fn () => $user?->permissionCodes() ?? [],
                'notifications' => fn () => $user ? [
                    'unread_count' => $user->unreadNotifications()->count(),
                    'items' => $user->notifications()->latest()
                        ->limit($user->role === UserRole::WarehouseManager ? 30 : 8)
                        ->get()->map(fn ($notification) => NotificationPresenter::make($notification)),
                ] : ['unread_count' => 0, 'items' => []],
            ],
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
            'approvalScope' => fn () => $user?->role === UserRole::WarehouseManager
                ? PendingApprovalStats::forWarehouseManager($user)
                : ['main' => [], 'counts' => []],
        ];
    }
}
