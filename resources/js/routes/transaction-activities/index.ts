import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../wayfinder'
/**
* @see \App\Http\Controllers\TransactionActivityController::__invoke
* @see app/Http/Controllers/TransactionActivityController.php:14
* @route '/transaction-activities'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/transaction-activities',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\TransactionActivityController::__invoke
* @see app/Http/Controllers/TransactionActivityController.php:14
* @route '/transaction-activities'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\TransactionActivityController::__invoke
* @see app/Http/Controllers/TransactionActivityController.php:14
* @route '/transaction-activities'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\TransactionActivityController::__invoke
* @see app/Http/Controllers/TransactionActivityController.php:14
* @route '/transaction-activities'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\TransactionActivityController::__invoke
* @see app/Http/Controllers/TransactionActivityController.php:14
* @route '/transaction-activities'
*/
const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\TransactionActivityController::__invoke
* @see app/Http/Controllers/TransactionActivityController.php:14
* @route '/transaction-activities'
*/
indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\TransactionActivityController::__invoke
* @see app/Http/Controllers/TransactionActivityController.php:14
* @route '/transaction-activities'
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

const transactionActivities = {
    index: Object.assign(index, index),
}

export default transactionActivities