import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../wayfinder'
/**
* @see \App\Http\Controllers\WarehouseManagementController::index
* @see app/Http/Controllers/WarehouseManagementController.php:19
* @route '/warehouse-management'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/warehouse-management',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\WarehouseManagementController::index
* @see app/Http/Controllers/WarehouseManagementController.php:19
* @route '/warehouse-management'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\WarehouseManagementController::index
* @see app/Http/Controllers/WarehouseManagementController.php:19
* @route '/warehouse-management'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\WarehouseManagementController::index
* @see app/Http/Controllers/WarehouseManagementController.php:19
* @route '/warehouse-management'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\WarehouseManagementController::index
* @see app/Http/Controllers/WarehouseManagementController.php:19
* @route '/warehouse-management'
*/
const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\WarehouseManagementController::index
* @see app/Http/Controllers/WarehouseManagementController.php:19
* @route '/warehouse-management'
*/
indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\WarehouseManagementController::index
* @see app/Http/Controllers/WarehouseManagementController.php:19
* @route '/warehouse-management'
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
* @see \App\Http\Controllers\WarehouseManagementController::store
* @see app/Http/Controllers/WarehouseManagementController.php:54
* @route '/warehouse-management'
*/
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/warehouse-management',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\WarehouseManagementController::store
* @see app/Http/Controllers/WarehouseManagementController.php:54
* @route '/warehouse-management'
*/
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\WarehouseManagementController::store
* @see app/Http/Controllers/WarehouseManagementController.php:54
* @route '/warehouse-management'
*/
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\WarehouseManagementController::store
* @see app/Http/Controllers/WarehouseManagementController.php:54
* @route '/warehouse-management'
*/
const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\WarehouseManagementController::store
* @see app/Http/Controllers/WarehouseManagementController.php:54
* @route '/warehouse-management'
*/
storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

store.form = storeForm

/**
* @see \App\Http\Controllers\WarehouseManagementController::update
* @see app/Http/Controllers/WarehouseManagementController.php:62
* @route '/warehouse-management/{warehouse}'
*/
export const update = (args: { warehouse: string | number | { id: string | number } } | [warehouse: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put","patch"],
    url: '/warehouse-management/{warehouse}',
} satisfies RouteDefinition<["put","patch"]>

/**
* @see \App\Http\Controllers\WarehouseManagementController::update
* @see app/Http/Controllers/WarehouseManagementController.php:62
* @route '/warehouse-management/{warehouse}'
*/
update.url = (args: { warehouse: string | number | { id: string | number } } | [warehouse: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { warehouse: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { warehouse: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            warehouse: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        warehouse: typeof args.warehouse === 'object'
        ? args.warehouse.id
        : args.warehouse,
    }

    return update.definition.url
            .replace('{warehouse}', parsedArgs.warehouse.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\WarehouseManagementController::update
* @see app/Http/Controllers/WarehouseManagementController.php:62
* @route '/warehouse-management/{warehouse}'
*/
update.put = (args: { warehouse: string | number | { id: string | number } } | [warehouse: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\WarehouseManagementController::update
* @see app/Http/Controllers/WarehouseManagementController.php:62
* @route '/warehouse-management/{warehouse}'
*/
update.patch = (args: { warehouse: string | number | { id: string | number } } | [warehouse: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

/**
* @see \App\Http\Controllers\WarehouseManagementController::update
* @see app/Http/Controllers/WarehouseManagementController.php:62
* @route '/warehouse-management/{warehouse}'
*/
const updateForm = (args: { warehouse: string | number | { id: string | number } } | [warehouse: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: update.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\WarehouseManagementController::update
* @see app/Http/Controllers/WarehouseManagementController.php:62
* @route '/warehouse-management/{warehouse}'
*/
updateForm.put = (args: { warehouse: string | number | { id: string | number } } | [warehouse: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: update.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\WarehouseManagementController::update
* @see app/Http/Controllers/WarehouseManagementController.php:62
* @route '/warehouse-management/{warehouse}'
*/
updateForm.patch = (args: { warehouse: string | number | { id: string | number } } | [warehouse: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: update.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PATCH',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

update.form = updateForm

/**
* @see \App\Http\Controllers\WarehouseManagementController::destroy
* @see app/Http/Controllers/WarehouseManagementController.php:82
* @route '/warehouse-management/{warehouse}'
*/
export const destroy = (args: { warehouse: string | number | { id: string | number } } | [warehouse: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/warehouse-management/{warehouse}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\WarehouseManagementController::destroy
* @see app/Http/Controllers/WarehouseManagementController.php:82
* @route '/warehouse-management/{warehouse}'
*/
destroy.url = (args: { warehouse: string | number | { id: string | number } } | [warehouse: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { warehouse: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { warehouse: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            warehouse: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        warehouse: typeof args.warehouse === 'object'
        ? args.warehouse.id
        : args.warehouse,
    }

    return destroy.definition.url
            .replace('{warehouse}', parsedArgs.warehouse.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\WarehouseManagementController::destroy
* @see app/Http/Controllers/WarehouseManagementController.php:82
* @route '/warehouse-management/{warehouse}'
*/
destroy.delete = (args: { warehouse: string | number | { id: string | number } } | [warehouse: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\WarehouseManagementController::destroy
* @see app/Http/Controllers/WarehouseManagementController.php:82
* @route '/warehouse-management/{warehouse}'
*/
const destroyForm = (args: { warehouse: string | number | { id: string | number } } | [warehouse: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\WarehouseManagementController::destroy
* @see app/Http/Controllers/WarehouseManagementController.php:82
* @route '/warehouse-management/{warehouse}'
*/
destroyForm.delete = (args: { warehouse: string | number | { id: string | number } } | [warehouse: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

destroy.form = destroyForm

const warehouseManagement = {
    index: Object.assign(index, index),
    store: Object.assign(store, store),
    update: Object.assign(update, update),
    destroy: Object.assign(destroy, destroy),
}

export default warehouseManagement