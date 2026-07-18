import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../wayfinder'
import roles from './roles'
import permissions from './permissions'
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

const accessManagement = {
    index: Object.assign(index, index),
    update: Object.assign(update, update),
    roles: Object.assign(roles, roles),
    permissions: Object.assign(permissions, permissions),
}

export default accessManagement