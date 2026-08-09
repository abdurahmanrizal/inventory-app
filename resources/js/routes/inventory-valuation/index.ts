import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../wayfinder'
/**
* @see \App\Http\Controllers\Settings\InventoryValuationController::edit
* @see app/Http/Controllers/Settings/InventoryValuationController.php:19
* @route '/settings/inventory-valuation'
*/
export const edit = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: edit.url(options),
    method: 'get',
})

edit.definition = {
    methods: ["get","head"],
    url: '/settings/inventory-valuation',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Settings\InventoryValuationController::edit
* @see app/Http/Controllers/Settings/InventoryValuationController.php:19
* @route '/settings/inventory-valuation'
*/
edit.url = (options?: RouteQueryOptions) => {
    return edit.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Settings\InventoryValuationController::edit
* @see app/Http/Controllers/Settings/InventoryValuationController.php:19
* @route '/settings/inventory-valuation'
*/
edit.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: edit.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Settings\InventoryValuationController::edit
* @see app/Http/Controllers/Settings/InventoryValuationController.php:19
* @route '/settings/inventory-valuation'
*/
edit.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: edit.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Settings\InventoryValuationController::edit
* @see app/Http/Controllers/Settings/InventoryValuationController.php:19
* @route '/settings/inventory-valuation'
*/
const editForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: edit.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Settings\InventoryValuationController::edit
* @see app/Http/Controllers/Settings/InventoryValuationController.php:19
* @route '/settings/inventory-valuation'
*/
editForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: edit.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Settings\InventoryValuationController::edit
* @see app/Http/Controllers/Settings/InventoryValuationController.php:19
* @route '/settings/inventory-valuation'
*/
editForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: edit.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

edit.form = editForm

/**
* @see \App\Http\Controllers\Settings\InventoryValuationController::update
* @see app/Http/Controllers/Settings/InventoryValuationController.php:33
* @route '/settings/inventory-valuation'
*/
export const update = (options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(options),
    method: 'put',
})

update.definition = {
    methods: ["put"],
    url: '/settings/inventory-valuation',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\Settings\InventoryValuationController::update
* @see app/Http/Controllers/Settings/InventoryValuationController.php:33
* @route '/settings/inventory-valuation'
*/
update.url = (options?: RouteQueryOptions) => {
    return update.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Settings\InventoryValuationController::update
* @see app/Http/Controllers/Settings/InventoryValuationController.php:33
* @route '/settings/inventory-valuation'
*/
update.put = (options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\Settings\InventoryValuationController::update
* @see app/Http/Controllers/Settings/InventoryValuationController.php:33
* @route '/settings/inventory-valuation'
*/
const updateForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: update.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Settings\InventoryValuationController::update
* @see app/Http/Controllers/Settings/InventoryValuationController.php:33
* @route '/settings/inventory-valuation'
*/
updateForm.put = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: update.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

update.form = updateForm

const inventoryValuation = {
    edit: Object.assign(edit, edit),
    update: Object.assign(update, update),
}

export default inventoryValuation