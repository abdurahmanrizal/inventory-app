import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../wayfinder'
/**
* @see \App\Http\Controllers\OperationsController::index
* @see app/Http/Controllers/OperationsController.php:73
* @route '/stock-requests'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/stock-requests',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\OperationsController::index
* @see app/Http/Controllers/OperationsController.php:73
* @route '/stock-requests'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\OperationsController::index
* @see app/Http/Controllers/OperationsController.php:73
* @route '/stock-requests'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\OperationsController::index
* @see app/Http/Controllers/OperationsController.php:73
* @route '/stock-requests'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\OperationsController::index
* @see app/Http/Controllers/OperationsController.php:73
* @route '/stock-requests'
*/
const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\OperationsController::index
* @see app/Http/Controllers/OperationsController.php:73
* @route '/stock-requests'
*/
indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\OperationsController::index
* @see app/Http/Controllers/OperationsController.php:73
* @route '/stock-requests'
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
* @see \App\Http\Controllers\OperationsController::deliveryNote
* @see app/Http/Controllers/OperationsController.php:35
* @route '/stock-requests/{stockRequest}/delivery-note'
*/
export const deliveryNote = (args: { stockRequest: number | { id: number } } | [stockRequest: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: deliveryNote.url(args, options),
    method: 'get',
})

deliveryNote.definition = {
    methods: ["get","head"],
    url: '/stock-requests/{stockRequest}/delivery-note',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\OperationsController::deliveryNote
* @see app/Http/Controllers/OperationsController.php:35
* @route '/stock-requests/{stockRequest}/delivery-note'
*/
deliveryNote.url = (args: { stockRequest: number | { id: number } } | [stockRequest: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { stockRequest: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { stockRequest: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            stockRequest: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        stockRequest: typeof args.stockRequest === 'object'
        ? args.stockRequest.id
        : args.stockRequest,
    }

    return deliveryNote.definition.url
            .replace('{stockRequest}', parsedArgs.stockRequest.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\OperationsController::deliveryNote
* @see app/Http/Controllers/OperationsController.php:35
* @route '/stock-requests/{stockRequest}/delivery-note'
*/
deliveryNote.get = (args: { stockRequest: number | { id: number } } | [stockRequest: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: deliveryNote.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\OperationsController::deliveryNote
* @see app/Http/Controllers/OperationsController.php:35
* @route '/stock-requests/{stockRequest}/delivery-note'
*/
deliveryNote.head = (args: { stockRequest: number | { id: number } } | [stockRequest: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: deliveryNote.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\OperationsController::deliveryNote
* @see app/Http/Controllers/OperationsController.php:35
* @route '/stock-requests/{stockRequest}/delivery-note'
*/
const deliveryNoteForm = (args: { stockRequest: number | { id: number } } | [stockRequest: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: deliveryNote.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\OperationsController::deliveryNote
* @see app/Http/Controllers/OperationsController.php:35
* @route '/stock-requests/{stockRequest}/delivery-note'
*/
deliveryNoteForm.get = (args: { stockRequest: number | { id: number } } | [stockRequest: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: deliveryNote.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\OperationsController::deliveryNote
* @see app/Http/Controllers/OperationsController.php:35
* @route '/stock-requests/{stockRequest}/delivery-note'
*/
deliveryNoteForm.head = (args: { stockRequest: number | { id: number } } | [stockRequest: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: deliveryNote.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

deliveryNote.form = deliveryNoteForm

const stockRequests = {
    index: Object.assign(index, index),
    deliveryNote: Object.assign(deliveryNote, deliveryNote),
}

export default stockRequests