import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../wayfinder'
/**
* @see \App\Http\Controllers\AccessManagementController::index
* @see app/Http/Controllers/AccessManagementController.php:30
* @route '/role-management'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/role-management',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\AccessManagementController::index
* @see app/Http/Controllers/AccessManagementController.php:30
* @route '/role-management'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\AccessManagementController::index
* @see app/Http/Controllers/AccessManagementController.php:30
* @route '/role-management'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\AccessManagementController::index
* @see app/Http/Controllers/AccessManagementController.php:30
* @route '/role-management'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\AccessManagementController::index
* @see app/Http/Controllers/AccessManagementController.php:30
* @route '/role-management'
*/
const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\AccessManagementController::index
* @see app/Http/Controllers/AccessManagementController.php:30
* @route '/role-management'
*/
indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\AccessManagementController::index
* @see app/Http/Controllers/AccessManagementController.php:30
* @route '/role-management'
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

const roleManagement = {
    index: Object.assign(index, index),
}

export default roleManagement