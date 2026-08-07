import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\WarehouseStockController::__invoke
* @see app/Http/Controllers/WarehouseStockController.php:16
* @route '/warehouse-stocks'
*/
const WarehouseStockController = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: WarehouseStockController.url(options),
    method: 'get',
})

WarehouseStockController.definition = {
    methods: ["get","head"],
    url: '/warehouse-stocks',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\WarehouseStockController::__invoke
* @see app/Http/Controllers/WarehouseStockController.php:16
* @route '/warehouse-stocks'
*/
WarehouseStockController.url = (options?: RouteQueryOptions) => {
    return WarehouseStockController.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\WarehouseStockController::__invoke
* @see app/Http/Controllers/WarehouseStockController.php:16
* @route '/warehouse-stocks'
*/
WarehouseStockController.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: WarehouseStockController.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\WarehouseStockController::__invoke
* @see app/Http/Controllers/WarehouseStockController.php:16
* @route '/warehouse-stocks'
*/
WarehouseStockController.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: WarehouseStockController.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\WarehouseStockController::__invoke
* @see app/Http/Controllers/WarehouseStockController.php:16
* @route '/warehouse-stocks'
*/
const WarehouseStockControllerForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: WarehouseStockController.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\WarehouseStockController::__invoke
* @see app/Http/Controllers/WarehouseStockController.php:16
* @route '/warehouse-stocks'
*/
WarehouseStockControllerForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: WarehouseStockController.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\WarehouseStockController::__invoke
* @see app/Http/Controllers/WarehouseStockController.php:16
* @route '/warehouse-stocks'
*/
WarehouseStockControllerForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: WarehouseStockController.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

WarehouseStockController.form = WarehouseStockControllerForm

export default WarehouseStockController