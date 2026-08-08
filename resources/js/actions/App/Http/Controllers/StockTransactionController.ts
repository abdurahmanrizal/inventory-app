import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\StockTransactionController::index
* @see app/Http/Controllers/StockTransactionController.php:30
* @route '/stock-transactions'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/stock-transactions',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\StockTransactionController::index
* @see app/Http/Controllers/StockTransactionController.php:30
* @route '/stock-transactions'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\StockTransactionController::index
* @see app/Http/Controllers/StockTransactionController.php:30
* @route '/stock-transactions'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\StockTransactionController::index
* @see app/Http/Controllers/StockTransactionController.php:30
* @route '/stock-transactions'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\StockTransactionController::index
* @see app/Http/Controllers/StockTransactionController.php:30
* @route '/stock-transactions'
*/
const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\StockTransactionController::index
* @see app/Http/Controllers/StockTransactionController.php:30
* @route '/stock-transactions'
*/
indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\StockTransactionController::index
* @see app/Http/Controllers/StockTransactionController.php:30
* @route '/stock-transactions'
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
* @see \App\Http\Controllers\StockTransactionController::store
* @see app/Http/Controllers/StockTransactionController.php:117
* @route '/stock-transactions'
*/
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/stock-transactions',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\StockTransactionController::store
* @see app/Http/Controllers/StockTransactionController.php:117
* @route '/stock-transactions'
*/
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\StockTransactionController::store
* @see app/Http/Controllers/StockTransactionController.php:117
* @route '/stock-transactions'
*/
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\StockTransactionController::store
* @see app/Http/Controllers/StockTransactionController.php:117
* @route '/stock-transactions'
*/
const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\StockTransactionController::store
* @see app/Http/Controllers/StockTransactionController.php:117
* @route '/stock-transactions'
*/
storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

store.form = storeForm

/**
* @see \App\Http\Controllers\StockTransactionController::document
* @see app/Http/Controllers/StockTransactionController.php:324
* @route '/stock-transactions/{transaction}/document'
*/
export const document = (args: { transaction: number | { id: number } } | [transaction: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: document.url(args, options),
    method: 'get',
})

document.definition = {
    methods: ["get","head"],
    url: '/stock-transactions/{transaction}/document',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\StockTransactionController::document
* @see app/Http/Controllers/StockTransactionController.php:324
* @route '/stock-transactions/{transaction}/document'
*/
document.url = (args: { transaction: number | { id: number } } | [transaction: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { transaction: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { transaction: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            transaction: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        transaction: typeof args.transaction === 'object'
        ? args.transaction.id
        : args.transaction,
    }

    return document.definition.url
            .replace('{transaction}', parsedArgs.transaction.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\StockTransactionController::document
* @see app/Http/Controllers/StockTransactionController.php:324
* @route '/stock-transactions/{transaction}/document'
*/
document.get = (args: { transaction: number | { id: number } } | [transaction: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: document.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\StockTransactionController::document
* @see app/Http/Controllers/StockTransactionController.php:324
* @route '/stock-transactions/{transaction}/document'
*/
document.head = (args: { transaction: number | { id: number } } | [transaction: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: document.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\StockTransactionController::document
* @see app/Http/Controllers/StockTransactionController.php:324
* @route '/stock-transactions/{transaction}/document'
*/
const documentForm = (args: { transaction: number | { id: number } } | [transaction: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: document.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\StockTransactionController::document
* @see app/Http/Controllers/StockTransactionController.php:324
* @route '/stock-transactions/{transaction}/document'
*/
documentForm.get = (args: { transaction: number | { id: number } } | [transaction: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: document.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\StockTransactionController::document
* @see app/Http/Controllers/StockTransactionController.php:324
* @route '/stock-transactions/{transaction}/document'
*/
documentForm.head = (args: { transaction: number | { id: number } } | [transaction: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: document.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

document.form = documentForm

/**
* @see \App\Http\Controllers\StockTransactionController::evidence
* @see app/Http/Controllers/StockTransactionController.php:377
* @route '/stock-transactions/{transaction}/evidence/{kind}'
*/
export const evidence = (args: { transaction: number | { id: number }, kind: string | number } | [transaction: number | { id: number }, kind: string | number ], options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: evidence.url(args, options),
    method: 'get',
})

evidence.definition = {
    methods: ["get","head"],
    url: '/stock-transactions/{transaction}/evidence/{kind}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\StockTransactionController::evidence
* @see app/Http/Controllers/StockTransactionController.php:377
* @route '/stock-transactions/{transaction}/evidence/{kind}'
*/
evidence.url = (args: { transaction: number | { id: number }, kind: string | number } | [transaction: number | { id: number }, kind: string | number ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
            transaction: args[0],
            kind: args[1],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        transaction: typeof args.transaction === 'object'
        ? args.transaction.id
        : args.transaction,
        kind: args.kind,
    }

    return evidence.definition.url
            .replace('{transaction}', parsedArgs.transaction.toString())
            .replace('{kind}', parsedArgs.kind.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\StockTransactionController::evidence
* @see app/Http/Controllers/StockTransactionController.php:377
* @route '/stock-transactions/{transaction}/evidence/{kind}'
*/
evidence.get = (args: { transaction: number | { id: number }, kind: string | number } | [transaction: number | { id: number }, kind: string | number ], options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: evidence.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\StockTransactionController::evidence
* @see app/Http/Controllers/StockTransactionController.php:377
* @route '/stock-transactions/{transaction}/evidence/{kind}'
*/
evidence.head = (args: { transaction: number | { id: number }, kind: string | number } | [transaction: number | { id: number }, kind: string | number ], options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: evidence.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\StockTransactionController::evidence
* @see app/Http/Controllers/StockTransactionController.php:377
* @route '/stock-transactions/{transaction}/evidence/{kind}'
*/
const evidenceForm = (args: { transaction: number | { id: number }, kind: string | number } | [transaction: number | { id: number }, kind: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: evidence.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\StockTransactionController::evidence
* @see app/Http/Controllers/StockTransactionController.php:377
* @route '/stock-transactions/{transaction}/evidence/{kind}'
*/
evidenceForm.get = (args: { transaction: number | { id: number }, kind: string | number } | [transaction: number | { id: number }, kind: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: evidence.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\StockTransactionController::evidence
* @see app/Http/Controllers/StockTransactionController.php:377
* @route '/stock-transactions/{transaction}/evidence/{kind}'
*/
evidenceForm.head = (args: { transaction: number | { id: number }, kind: string | number } | [transaction: number | { id: number }, kind: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: evidence.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

evidence.form = evidenceForm

const StockTransactionController = { index, store, document, evidence }

export default StockTransactionController