import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../wayfinder'
/**
* @see \App\Http\Controllers\WarehouseStockController::__invoke
* @see app/Http/Controllers/WarehouseStockController.php:14
* @route '/warehouse-stocks'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/warehouse-stocks',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\WarehouseStockController::__invoke
* @see app/Http/Controllers/WarehouseStockController.php:14
* @route '/warehouse-stocks'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\WarehouseStockController::__invoke
* @see app/Http/Controllers/WarehouseStockController.php:14
* @route '/warehouse-stocks'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\WarehouseStockController::__invoke
* @see app/Http/Controllers/WarehouseStockController.php:14
* @route '/warehouse-stocks'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\WarehouseStockController::__invoke
* @see app/Http/Controllers/WarehouseStockController.php:14
* @route '/warehouse-stocks'
*/
const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\WarehouseStockController::__invoke
* @see app/Http/Controllers/WarehouseStockController.php:14
* @route '/warehouse-stocks'
*/
indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\WarehouseStockController::__invoke
* @see app/Http/Controllers/WarehouseStockController.php:14
* @route '/warehouse-stocks'
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

const warehouseStocks = {
    index: Object.assign(index, index),
}

export default warehouseStocks