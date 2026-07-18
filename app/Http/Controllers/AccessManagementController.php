<?php

namespace App\Http\Controllers;

use App\Enums\UserRole;
use App\Support\AccessPermissions;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class AccessManagementController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorizeSuperadmin($request);
        $this->ensureCatalog();

        $roles = DB::table('roles')->orderByRaw("code = 'superadmin' desc")->orderBy('name')->get();
        $permissions = DB::table('permissions')->orderBy('module')->orderBy('name')->get();
        $assigned = DB::table('role_permissions')->join('permissions', 'permissions.id', '=', 'role_permissions.permission_id')
            ->select('role_permissions.role_id', 'permissions.code')->get()->groupBy('role_id')->map->pluck('code');

        return Inertia::render('AccessManagement/Index', compact('roles', 'permissions', 'assigned'));
    }

    public function roles(Request $request): Response
    {
        $this->authorizeSuperadmin($request);
        $this->ensureCatalog();

        return Inertia::render('RoleManagement/Index', [
            'roles' => DB::table('roles')->orderByRaw("code = 'superadmin' desc")->orderBy('name')->get(),
            'systemRoles' => collect(UserRole::cases())->pluck('value'),
        ]);
    }

    public function permissions(Request $request): Response
    {
        $this->authorizeSuperadmin($request);
        $this->ensureCatalog();

        return Inertia::render('PermissionManagement/Index', [
            'permissions' => DB::table('permissions')->orderBy('module')->orderBy('name')->get(),
        ]);
    }

    public function update(Request $request, int $role): RedirectResponse
    {
        $this->authorizeSuperadmin($request);
        $this->ensureCatalog();
        $roleRow = DB::table('roles')->find($role);
        abort_unless($roleRow, 404);
        abort_if($roleRow->code === UserRole::Superadmin->value, 422, 'Akses Super Admin tidak dapat dibatasi.');
        $data = $request->validate(['permissions' => ['array'], 'permissions.*' => ['string', Rule::exists('permissions', 'code')]]);
        $permissionIds = DB::table('permissions')->whereIn('code', $data['permissions'] ?? [])->pluck('id');

        DB::transaction(function () use ($role, $permissionIds): void {
            DB::table('role_permissions')->where('role_id', $role)->delete();
            DB::table('role_permissions')->insert($permissionIds->map(fn ($id) => ['role_id' => $role, 'permission_id' => $id])->all());
        });

        return back()->with('success', 'Hak akses role berhasil diperbarui.');
    }

    public function storeRole(Request $request): RedirectResponse
    {
        $this->authorizeSuperadmin($request);
        $data = $request->validate($this->roleRules());
        DB::table('roles')->insert($data + ['created_at' => now(), 'updated_at' => now()]);

        return back()->with('success', 'Role berhasil ditambahkan.');
    }

    public function updateRole(Request $request, int $role): RedirectResponse
    {
        $this->authorizeSuperadmin($request);
        $roleRow = DB::table('roles')->find($role);
        abort_unless($roleRow, 404);
        $data = $request->validate($this->roleRules($role));
        if ($this->isSystemRole($roleRow->code) && $data['code'] !== $roleRow->code) {
            throw ValidationException::withMessages(['code' => 'Kode role sistem tidak dapat diubah.']);
        }
        DB::table('roles')->where('id', $role)->update($data + ['updated_at' => now()]);

        return back()->with('success', 'Role berhasil diperbarui.');
    }

    public function destroyRole(Request $request, int $role): RedirectResponse
    {
        $this->authorizeSuperadmin($request);
        $roleRow = DB::table('roles')->find($role);
        abort_unless($roleRow, 404);
        if ($this->isSystemRole($roleRow->code)) {
            throw ValidationException::withMessages(['role' => 'Role bawaan sistem tidak dapat dihapus.']);
        }
        if (DB::table('role_user')->where('role_id', $role)->exists() || DB::table('users')->where('role', $roleRow->code)->exists()) {
            throw ValidationException::withMessages(['role' => 'Role masih digunakan oleh pengguna dan tidak dapat dihapus.']);
        }
        DB::table('roles')->where('id', $role)->delete();

        return back()->with('success', 'Role berhasil dihapus.');
    }

    public function storePermission(Request $request): RedirectResponse
    {
        $this->authorizeSuperadmin($request);
        $data = $request->validate($this->permissionRules());
        DB::table('permissions')->insert($data + ['created_at' => now(), 'updated_at' => now()]);

        return back()->with('success', 'Permission berhasil ditambahkan.');
    }

    public function updatePermission(Request $request, int $permission): RedirectResponse
    {
        $this->authorizeSuperadmin($request);
        abort_unless(DB::table('permissions')->where('id', $permission)->exists(), 404);
        $data = $request->validate($this->permissionRules($permission));
        DB::table('permissions')->where('id', $permission)->update($data + ['updated_at' => now()]);

        return back()->with('success', 'Permission berhasil diperbarui.');
    }

    public function destroyPermission(Request $request, int $permission): RedirectResponse
    {
        $this->authorizeSuperadmin($request);
        $permissionRow = DB::table('permissions')->find($permission);
        abort_unless($permissionRow, 404);
        DB::table('permissions')->where('id', $permission)->delete();

        return back()->with('success', 'Permission berhasil dihapus.');
    }

    private function ensureCatalog(): void
    {
        foreach (UserRole::cases() as $role) {
            DB::table('roles')->insertOrIgnore(['code' => $role->value, 'name' => ucwords(str_replace('_', ' ', $role->value)), 'description' => 'Role bisnis WMS', 'updated_at' => now(), 'created_at' => now()]);
        }
        if (DB::table('permissions')->doesntExist()) {
            foreach (AccessPermissions::CATALOG as $code => [$name, $description]) {
                DB::table('permissions')->insert(['code' => $code, 'name' => $name, 'module' => $description, 'updated_at' => now(), 'created_at' => now()]);
                foreach (AccessPermissions::DEFAULTS as $roleCode => $defaults) {
                    if ($defaults === ['*'] || in_array($code, $defaults, true)) {
                        DB::table('role_permissions')->insertOrIgnore(['role_id' => DB::table('roles')->where('code', $roleCode)->value('id'), 'permission_id' => DB::table('permissions')->where('code', $code)->value('id')]);
                    }
                }
            }
        }
    }

    private function authorizeSuperadmin(Request $request): void
    {
        abort_unless($request->user()->role === UserRole::Superadmin, 403);
    }

    private function roleRules(?int $role = null): array
    {
        return [
            'code' => ['required', 'string', 'max:80', 'regex:/^[a-z][a-z0-9_]*$/', Rule::unique('roles', 'code')->ignore($role)],
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:1000'],
        ];
    }

    private function permissionRules(?int $permission = null): array
    {
        return [
            'code' => ['required', 'string', 'max:100', 'regex:/^[a-z][a-z0-9_.-]*$/', Rule::unique('permissions', 'code')->ignore($permission)],
            'name' => ['required', 'string', 'max:255'],
            'module' => ['required', 'string', 'max:255'],
        ];
    }

    private function isSystemRole(string $code): bool
    {
        return in_array($code, collect(UserRole::cases())->pluck('value')->all(), true);
    }
}
