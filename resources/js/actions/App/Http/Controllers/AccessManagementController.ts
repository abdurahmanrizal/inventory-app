import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\AccessManagementController::index
* @see app/Http/Controllers/AccessManagementController.php:17
* @route '/access-management'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/access-management',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\AccessManagementController::index
* @see app/Http/Controllers/AccessManagementController.php:17
* @route '/access-management'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\AccessManagementController::index
* @see app/Http/Controllers/AccessManagementController.php:17
* @route '/access-management'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\AccessManagementController::index
* @see app/Http/Controllers/AccessManagementController.php:17
* @route '/access-management'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\AccessManagementController::index
* @see app/Http/Controllers/AccessManagementController.php:17
* @route '/access-management'
*/
const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\AccessManagementController::index
* @see app/Http/Controllers/AccessManagementController.php:17
* @route '/access-management'
*/
indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\AccessManagementController::index
* @see app/Http/Controllers/AccessManagementController.php:17
* @route '/access-management'
*/
indexForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

index.form = indexForm

/**
* @see \App\Http\Controllers\AccessManagementController::roles
* @see app/Http/Controllers/AccessManagementController.php:30
* @route '/role-management'
*/
export const roles = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: roles.url(options),
    method: 'get',
})

roles.definition = {
    methods: ["get","head"],
    url: '/role-management',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\AccessManagementController::roles
* @see app/Http/Controllers/AccessManagementController.php:30
* @route '/role-management'
*/
roles.url = (options?: RouteQueryOptions) => {
    return roles.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\AccessManagementController::roles
* @see app/Http/Controllers/AccessManagementController.php:30
* @route '/role-management'
*/
roles.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: roles.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\AccessManagementController::roles
* @see app/Http/Controllers/AccessManagementController.php:30
* @route '/role-management'
*/
roles.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: roles.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\AccessManagementController::roles
* @see app/Http/Controllers/AccessManagementController.php:30
* @route '/role-management'
*/
const rolesForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: roles.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\AccessManagementController::roles
* @see app/Http/Controllers/AccessManagementController.php:30
* @route '/role-management'
*/
rolesForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: roles.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\AccessManagementController::roles
* @see app/Http/Controllers/AccessManagementController.php:30
* @route '/role-management'
*/
rolesForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: roles.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

roles.form = rolesForm

/**
* @see \App\Http\Controllers\AccessManagementController::permissions
* @see app/Http/Controllers/AccessManagementController.php:41
* @route '/permission-management'
*/
export const permissions = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: permissions.url(options),
    method: 'get',
})

permissions.definition = {
    methods: ["get","head"],
    url: '/permission-management',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\AccessManagementController::permissions
* @see app/Http/Controllers/AccessManagementController.php:41
* @route '/permission-management'
*/
permissions.url = (options?: RouteQueryOptions) => {
    return permissions.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\AccessManagementController::permissions
* @see app/Http/Controllers/AccessManagementController.php:41
* @route '/permission-management'
*/
permissions.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: permissions.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\AccessManagementController::permissions
* @see app/Http/Controllers/AccessManagementController.php:41
* @route '/permission-management'
*/
permissions.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: permissions.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\AccessManagementController::permissions
* @see app/Http/Controllers/AccessManagementController.php:41
* @route '/permission-management'
*/
const permissionsForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: permissions.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\AccessManagementController::permissions
* @see app/Http/Controllers/AccessManagementController.php:41
* @route '/permission-management'
*/
permissionsForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: permissions.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\AccessManagementController::permissions
* @see app/Http/Controllers/AccessManagementController.php:41
* @route '/permission-management'
*/
permissionsForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: permissions.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

permissions.form = permissionsForm

/**
* @see \App\Http\Controllers\AccessManagementController::update
* @see app/Http/Controllers/AccessManagementController.php:51
* @route '/access-management/{role}'
*/
export const update = (args: { role: string | number } | [role: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put"],
    url: '/access-management/{role}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\AccessManagementController::update
* @see app/Http/Controllers/AccessManagementController.php:51
* @route '/access-management/{role}'
*/
update.url = (args: { role: string | number } | [role: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { role: args }
    }

    if (Array.isArray(args)) {
        args = {
            role: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        role: args.role,
    }

    return update.definition.url
            .replace('{role}', parsedArgs.role.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\AccessManagementController::update
* @see app/Http/Controllers/AccessManagementController.php:51
* @route '/access-management/{role}'
*/
update.put = (args: { role: string | number } | [role: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\AccessManagementController::update
* @see app/Http/Controllers/AccessManagementController.php:51
* @route '/access-management/{role}'
*/
const updateForm = (args: { role: string | number } | [role: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: update.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\AccessManagementController::update
* @see app/Http/Controllers/AccessManagementController.php:51
* @route '/access-management/{role}'
*/
updateForm.put = (args: { role: string | number } | [role: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: update.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

update.form = updateForm

/**
* @see \App\Http\Controllers\AccessManagementController::storeRole
* @see app/Http/Controllers/AccessManagementController.php:69
* @route '/access-management/roles'
*/
export const storeRole = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: storeRole.url(options),
    method: 'post',
})

storeRole.definition = {
    methods: ["post"],
    url: '/access-management/roles',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\AccessManagementController::storeRole
* @see app/Http/Controllers/AccessManagementController.php:69
* @route '/access-management/roles'
*/
storeRole.url = (options?: RouteQueryOptions) => {
    return storeRole.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\AccessManagementController::storeRole
* @see app/Http/Controllers/AccessManagementController.php:69
* @route '/access-management/roles'
*/
storeRole.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: storeRole.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\AccessManagementController::storeRole
* @see app/Http/Controllers/AccessManagementController.php:69
* @route '/access-management/roles'
*/
const storeRoleForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: storeRole.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\AccessManagementController::storeRole
* @see app/Http/Controllers/AccessManagementController.php:69
* @route '/access-management/roles'
*/
storeRoleForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: storeRole.url(options),
    method: 'post',
})

storeRole.form = storeRoleForm

/**
* @see \App\Http\Controllers\AccessManagementController::updateRole
* @see app/Http/Controllers/AccessManagementController.php:78
* @route '/access-management/roles/{role}'
*/
export const updateRole = (args: { role: string | number } | [role: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: updateRole.url(args, options),
    method: 'put',
})

updateRole.definition = {
    methods: ["put"],
    url: '/access-management/roles/{role}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\AccessManagementController::updateRole
* @see app/Http/Controllers/AccessManagementController.php:78
* @route '/access-management/roles/{role}'
*/
updateRole.url = (args: { role: string | number } | [role: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { role: args }
    }

    if (Array.isArray(args)) {
        args = {
            role: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        role: args.role,
    }

    return updateRole.definition.url
            .replace('{role}', parsedArgs.role.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\AccessManagementController::updateRole
* @see app/Http/Controllers/AccessManagementController.php:78
* @route '/access-management/roles/{role}'
*/
updateRole.put = (args: { role: string | number } | [role: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: updateRole.url(args, options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\AccessManagementController::updateRole
* @see app/Http/Controllers/AccessManagementController.php:78
* @route '/access-management/roles/{role}'
*/
const updateRoleForm = (args: { role: string | number } | [role: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: updateRole.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\AccessManagementController::updateRole
* @see app/Http/Controllers/AccessManagementController.php:78
* @route '/access-management/roles/{role}'
*/
updateRoleForm.put = (args: { role: string | number } | [role: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: updateRole.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

updateRole.form = updateRoleForm

/**
* @see \App\Http\Controllers\AccessManagementController::destroyRole
* @see app/Http/Controllers/AccessManagementController.php:92
* @route '/access-management/roles/{role}'
*/
export const destroyRole = (args: { role: string | number } | [role: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroyRole.url(args, options),
    method: 'delete',
})

destroyRole.definition = {
    methods: ["delete"],
    url: '/access-management/roles/{role}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\AccessManagementController::destroyRole
* @see app/Http/Controllers/AccessManagementController.php:92
* @route '/access-management/roles/{role}'
*/
destroyRole.url = (args: { role: string | number } | [role: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { role: args }
    }

    if (Array.isArray(args)) {
        args = {
            role: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        role: args.role,
    }

    return destroyRole.definition.url
            .replace('{role}', parsedArgs.role.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\AccessManagementController::destroyRole
* @see app/Http/Controllers/AccessManagementController.php:92
* @route '/access-management/roles/{role}'
*/
destroyRole.delete = (args: { role: string | number } | [role: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroyRole.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\AccessManagementController::destroyRole
* @see app/Http/Controllers/AccessManagementController.php:92
* @route '/access-management/roles/{role}'
*/
const destroyRoleForm = (args: { role: string | number } | [role: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroyRole.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\AccessManagementController::destroyRole
* @see app/Http/Controllers/AccessManagementController.php:92
* @route '/access-management/roles/{role}'
*/
destroyRoleForm.delete = (args: { role: string | number } | [role: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroyRole.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

destroyRole.form = destroyRoleForm

/**
* @see \App\Http\Controllers\AccessManagementController::storePermission
* @see app/Http/Controllers/AccessManagementController.php:108
* @route '/access-management/permissions'
*/
export const storePermission = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: storePermission.url(options),
    method: 'post',
})

storePermission.definition = {
    methods: ["post"],
    url: '/access-management/permissions',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\AccessManagementController::storePermission
* @see app/Http/Controllers/AccessManagementController.php:108
* @route '/access-management/permissions'
*/
storePermission.url = (options?: RouteQueryOptions) => {
    return storePermission.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\AccessManagementController::storePermission
* @see app/Http/Controllers/AccessManagementController.php:108
* @route '/access-management/permissions'
*/
storePermission.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: storePermission.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\AccessManagementController::storePermission
* @see app/Http/Controllers/AccessManagementController.php:108
* @route '/access-management/permissions'
*/
const storePermissionForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: storePermission.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\AccessManagementController::storePermission
* @see app/Http/Controllers/AccessManagementController.php:108
* @route '/access-management/permissions'
*/
storePermissionForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: storePermission.url(options),
    method: 'post',
})

storePermission.form = storePermissionForm

/**
* @see \App\Http\Controllers\AccessManagementController::updatePermission
* @see app/Http/Controllers/AccessManagementController.php:117
* @route '/access-management/permissions/{permission}'
*/
export const updatePermission = (args: { permission: string | number } | [permission: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: updatePermission.url(args, options),
    method: 'put',
})

updatePermission.definition = {
    methods: ["put"],
    url: '/access-management/permissions/{permission}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\AccessManagementController::updatePermission
* @see app/Http/Controllers/AccessManagementController.php:117
* @route '/access-management/permissions/{permission}'
*/
updatePermission.url = (args: { permission: string | number } | [permission: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { permission: args }
    }

    if (Array.isArray(args)) {
        args = {
            permission: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        permission: args.permission,
    }

    return updatePermission.definition.url
            .replace('{permission}', parsedArgs.permission.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\AccessManagementController::updatePermission
* @see app/Http/Controllers/AccessManagementController.php:117
* @route '/access-management/permissions/{permission}'
*/
updatePermission.put = (args: { permission: string | number } | [permission: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: updatePermission.url(args, options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\AccessManagementController::updatePermission
* @see app/Http/Controllers/AccessManagementController.php:117
* @route '/access-management/permissions/{permission}'
*/
const updatePermissionForm = (args: { permission: string | number } | [permission: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: updatePermission.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\AccessManagementController::updatePermission
* @see app/Http/Controllers/AccessManagementController.php:117
* @route '/access-management/permissions/{permission}'
*/
updatePermissionForm.put = (args: { permission: string | number } | [permission: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: updatePermission.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

updatePermission.form = updatePermissionForm

/**
* @see \App\Http\Controllers\AccessManagementController::destroyPermission
* @see app/Http/Controllers/AccessManagementController.php:127
* @route '/access-management/permissions/{permission}'
*/
export const destroyPermission = (args: { permission: string | number } | [permission: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroyPermission.url(args, options),
    method: 'delete',
})

destroyPermission.definition = {
    methods: ["delete"],
    url: '/access-management/permissions/{permission}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\AccessManagementController::destroyPermission
* @see app/Http/Controllers/AccessManagementController.php:127
* @route '/access-management/permissions/{permission}'
*/
destroyPermission.url = (args: { permission: string | number } | [permission: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { permission: args }
    }

    if (Array.isArray(args)) {
        args = {
            permission: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        permission: args.permission,
    }

    return destroyPermission.definition.url
            .replace('{permission}', parsedArgs.permission.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\AccessManagementController::destroyPermission
* @see app/Http/Controllers/AccessManagementController.php:127
* @route '/access-management/permissions/{permission}'
*/
destroyPermission.delete = (args: { permission: string | number } | [permission: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroyPermission.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\AccessManagementController::destroyPermission
* @see app/Http/Controllers/AccessManagementController.php:127
* @route '/access-management/permissions/{permission}'
*/
const destroyPermissionForm = (args: { permission: string | number } | [permission: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroyPermission.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\AccessManagementController::destroyPermission
* @see app/Http/Controllers/AccessManagementController.php:127
* @route '/access-management/permissions/{permission}'
*/
destroyPermissionForm.delete = (args: { permission: string | number } | [permission: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroyPermission.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

destroyPermission.form = destroyPermissionForm

const AccessManagementController = { index, roles, permissions, update, storeRole, updateRole, destroyRole, storePermission, updatePermission, destroyPermission }

export default AccessManagementController