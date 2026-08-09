import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\TransactionActivityController::__invoke
* @see app/Http/Controllers/TransactionActivityController.php:15
* @route '/transaction-activities'
*/
const TransactionActivityController = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: TransactionActivityController.url(options),
    method: 'get',
})

TransactionActivityController.definition = {
    methods: ["get","head"],
    url: '/transaction-activities',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\TransactionActivityController::__invoke
* @see app/Http/Controllers/TransactionActivityController.php:15
* @route '/transaction-activities'
*/
TransactionActivityController.url = (options?: RouteQueryOptions) => {
    return TransactionActivityController.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\TransactionActivityController::__invoke
* @see app/Http/Controllers/TransactionActivityController.php:15
* @route '/transaction-activities'
*/
TransactionActivityController.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: TransactionActivityController.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\TransactionActivityController::__invoke
* @see app/Http/Controllers/TransactionActivityController.php:15
* @route '/transaction-activities'
*/
TransactionActivityController.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: TransactionActivityController.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\TransactionActivityController::__invoke
* @see app/Http/Controllers/TransactionActivityController.php:15
* @route '/transaction-activities'
*/
const TransactionActivityControllerForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: TransactionActivityController.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\TransactionActivityController::__invoke
* @see app/Http/Controllers/TransactionActivityController.php:15
* @route '/transaction-activities'
*/
TransactionActivityControllerForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: TransactionActivityController.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\TransactionActivityController::__invoke
* @see app/Http/Controllers/TransactionActivityController.php:15
* @route '/transaction-activities'
*/
TransactionActivityControllerForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: TransactionActivityController.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

TransactionActivityController.form = TransactionActivityControllerForm

export default TransactionActivityController