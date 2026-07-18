import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\AccessManagementController::store
* @see app/Http/Controllers/AccessManagementController.php:108
* @route '/access-management/permissions'
*/
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/access-management/permissions',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\AccessManagementController::store
* @see app/Http/Controllers/AccessManagementController.php:108
* @route '/access-management/permissions'
*/
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\AccessManagementController::store
* @see app/Http/Controllers/AccessManagementController.php:108
* @route '/access-management/permissions'
*/
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\AccessManagementController::store
* @see app/Http/Controllers/AccessManagementController.php:108
* @route '/access-management/permissions'
*/
const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\AccessManagementController::store
* @see app/Http/Controllers/AccessManagementController.php:108
* @route '/access-management/permissions'
*/
storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

store.form = storeForm

/**
* @see \App\Http\Controllers\AccessManagementController::update
* @see app/Http/Controllers/AccessManagementController.php:117
* @route '/access-management/permissions/{permission}'
*/
export const update = (args: { permission: string | number } | [permission: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put"],
    url: '/access-management/permissions/{permission}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\AccessManagementController::update
* @see app/Http/Controllers/AccessManagementController.php:117
* @route '/access-management/permissions/{permission}'
*/
update.url = (args: { permission: string | number } | [permission: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return update.definition.url
            .replace('{permission}', parsedArgs.permission.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\AccessManagementController::update
* @see app/Http/Controllers/AccessManagementController.php:117
* @route '/access-management/permissions/{permission}'
*/
update.put = (args: { permission: string | number } | [permission: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\AccessManagementController::update
* @see app/Http/Controllers/AccessManagementController.php:117
* @route '/access-management/permissions/{permission}'
*/
const updateForm = (args: { permission: string | number } | [permission: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
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
* @see app/Http/Controllers/AccessManagementController.php:117
* @route '/access-management/permissions/{permission}'
*/
updateForm.put = (args: { permission: string | number } | [permission: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
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
* @see \App\Http\Controllers\AccessManagementController::destroy
* @see app/Http/Controllers/AccessManagementController.php:127
* @route '/access-management/permissions/{permission}'
*/
export const destroy = (args: { permission: string | number } | [permission: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/access-management/permissions/{permission}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\AccessManagementController::destroy
* @see app/Http/Controllers/AccessManagementController.php:127
* @route '/access-management/permissions/{permission}'
*/
destroy.url = (args: { permission: string | number } | [permission: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return destroy.definition.url
            .replace('{permission}', parsedArgs.permission.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\AccessManagementController::destroy
* @see app/Http/Controllers/AccessManagementController.php:127
* @route '/access-management/permissions/{permission}'
*/
destroy.delete = (args: { permission: string | number } | [permission: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\AccessManagementController::destroy
* @see app/Http/Controllers/AccessManagementController.php:127
* @route '/access-management/permissions/{permission}'
*/
const destroyForm = (args: { permission: string | number } | [permission: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\AccessManagementController::destroy
* @see app/Http/Controllers/AccessManagementController.php:127
* @route '/access-management/permissions/{permission}'
*/
destroyForm.delete = (args: { permission: string | number } | [permission: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

destroy.form = destroyForm

const permissions = {
    store: Object.assign(store, store),
    update: Object.assign(update, update),
    destroy: Object.assign(destroy, destroy),
}

export default permissions