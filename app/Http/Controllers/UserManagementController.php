<?php

namespace App\Http\Controllers;

use App\Enums\UserRole;
use App\Models\User;
use App\Models\Warehouse;
use Illuminate\Database\QueryException;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class UserManagementController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorizeSuperadmin($request);

        $search = trim($request->string('search')->toString());
        $role = $request->string('role')->toString();
        $validRoles = collect(UserRole::cases())->pluck('value');
        abort_if($role !== '' && ! $validRoles->contains($role), 422, 'Filter role tidak valid.');

        $query = User::query()
            ->with('warehouse:id,code,name,type')
            ->when($search, fn ($query) => $query->where(fn ($query) => $query
                ->where('name', 'like', "%{$search}%")
                ->orWhere('email', 'like', "%{$search}%")
                ->orWhere('role', 'like', "%{$search}%")
                ->orWhereHas('warehouse', fn ($query) => $query
                    ->where('name', 'like', "%{$search}%")
                    ->orWhere('code', 'like', "%{$search}%"))));

        $roleCounts = (clone $query)
            ->selectRaw('role, COUNT(*) as aggregate')
            ->groupBy('role')
            ->pluck('aggregate', 'role');

        return Inertia::render('UserManagement/Index', [
            'users' => $query
                ->when($role, fn ($query) => $query->where('role', $role))
                ->orderBy('name')
                ->paginate(20)
                ->withQueryString(),
            'warehouses' => Warehouse::where('is_active', true)->orderBy('name')->get(['id', 'code', 'name', 'type']),
            'roles' => collect(UserRole::cases())->map(fn (UserRole $role) => [
                'value' => $role->value,
                'label' => UserRole::label($role),
            ]),
            'filters' => ['search' => $search, 'role' => $role],
            'roleCounts' => $roleCounts,
            'totalUsers' => User::count(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $this->authorizeSuperadmin($request);
        $data = $request->validate($this->rules());
        User::create($data + ['email_verified_at' => now()]);

        return back()->with('success', 'User berhasil ditambahkan.');
    }

    public function update(Request $request, User $user): RedirectResponse
    {
        $this->authorizeSuperadmin($request);
        $data = $request->validate($this->rules($user));
        if (blank($data['password'] ?? null)) {
            unset($data['password']);
        }
        if ($request->user()->is($user) && ($data['role'] ?? null) !== UserRole::Superadmin->value) {
            throw ValidationException::withMessages(['role' => 'Anda tidak dapat mengubah role akun sendiri dari Super Admin.']);
        }
        $user->update($data);

        return back()->with('success', 'User berhasil diperbarui.');
    }

    public function destroy(Request $request, User $user): RedirectResponse
    {
        $this->authorizeSuperadmin($request);
        if ($request->user()->is($user)) {
            throw ValidationException::withMessages(['user' => 'Anda tidak dapat menghapus akun yang sedang digunakan.']);
        }

        try {
            $user->delete();
        } catch (QueryException) {
            throw ValidationException::withMessages(['user' => 'User tidak dapat dihapus karena sudah memiliki transaksi atau riwayat approval. Ubah data user bila diperlukan.']);
        }

        return back()->with('success', 'User berhasil dihapus.');
    }

    private function rules(?User $user = null): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', Rule::unique('users', 'email')->ignore($user)],
            'role' => ['required', Rule::enum(UserRole::class)],
            'warehouse_id' => ['nullable', 'exists:warehouses,id', Rule::requiredIf(fn () => ! in_array(request('role'), [UserRole::Superadmin->value, UserRole::Finance->value, UserRole::WarehouseManager->value], true))],
            'password' => [$user ? 'nullable' : 'required', 'string', 'min:8', 'confirmed'],
        ];
    }

    private function authorizeSuperadmin(Request $request): void
    {
        abort_unless($request->user()->role === UserRole::Superadmin, 403);
    }
}
