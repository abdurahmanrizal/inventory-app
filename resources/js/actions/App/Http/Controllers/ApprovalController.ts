import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\ApprovalController::index
* @see app/Http/Controllers/ApprovalController.php:21
* @route '/approvals'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/approvals',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ApprovalController::index
* @see app/Http/Controllers/ApprovalController.php:21
* @route '/approvals'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\ApprovalController::index
* @see app/Http/Controllers/ApprovalController.php:21
* @route '/approvals'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ApprovalController::index
* @see app/Http/Controllers/ApprovalController.php:21
* @route '/approvals'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\ApprovalController::index
* @see app/Http/Controllers/ApprovalController.php:21
* @route '/approvals'
*/
const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ApprovalController::index
* @see app/Http/Controllers/ApprovalController.php:21
* @route '/approvals'
*/
indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ApprovalController::index
* @see app/Http/Controllers/ApprovalController.php:21
* @route '/approvals'
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
* @see \App\Http\Controllers\ApprovalController::approve
* @see app/Http/Controllers/ApprovalController.php:199
* @route '/approvals/{transaction}/approve'
*/
export const approve = (args: { transaction: string | number | { id: string | number } } | [transaction: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: approve.url(args, options),
    method: 'post',
})

approve.definition = {
    methods: ["post"],
    url: '/approvals/{transaction}/approve',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\ApprovalController::approve
* @see app/Http/Controllers/ApprovalController.php:199
* @route '/approvals/{transaction}/approve'
*/
approve.url = (args: { transaction: string | number | { id: string | number } } | [transaction: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions) => {
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

    return approve.definition.url
            .replace('{transaction}', parsedArgs.transaction.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ApprovalController::approve
* @see app/Http/Controllers/ApprovalController.php:199
* @route '/approvals/{transaction}/approve'
*/
approve.post = (args: { transaction: string | number | { id: string | number } } | [transaction: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: approve.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\ApprovalController::approve
* @see app/Http/Controllers/ApprovalController.php:199
* @route '/approvals/{transaction}/approve'
*/
const approveForm = (args: { transaction: string | number | { id: string | number } } | [transaction: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: approve.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\ApprovalController::approve
* @see app/Http/Controllers/ApprovalController.php:199
* @route '/approvals/{transaction}/approve'
*/
approveForm.post = (args: { transaction: string | number | { id: string | number } } | [transaction: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: approve.url(args, options),
    method: 'post',
})

approve.form = approveForm

/**
* @see \App\Http\Controllers\ApprovalController::reject
* @see app/Http/Controllers/ApprovalController.php:213
* @route '/approvals/{transaction}/reject'
*/
export const reject = (args: { transaction: string | number | { id: string | number } } | [transaction: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: reject.url(args, options),
    method: 'post',
})

reject.definition = {
    methods: ["post"],
    url: '/approvals/{transaction}/reject',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\ApprovalController::reject
* @see app/Http/Controllers/ApprovalController.php:213
* @route '/approvals/{transaction}/reject'
*/
reject.url = (args: { transaction: string | number | { id: string | number } } | [transaction: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions) => {
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

    return reject.definition.url
            .replace('{transaction}', parsedArgs.transaction.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ApprovalController::reject
* @see app/Http/Controllers/ApprovalController.php:213
* @route '/approvals/{transaction}/reject'
*/
reject.post = (args: { transaction: string | number | { id: string | number } } | [transaction: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: reject.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\ApprovalController::reject
* @see app/Http/Controllers/ApprovalController.php:213
* @route '/approvals/{transaction}/reject'
*/
const rejectForm = (args: { transaction: string | number | { id: string | number } } | [transaction: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: reject.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\ApprovalController::reject
* @see app/Http/Controllers/ApprovalController.php:213
* @route '/approvals/{transaction}/reject'
*/
rejectForm.post = (args: { transaction: string | number | { id: string | number } } | [transaction: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: reject.url(args, options),
    method: 'post',
})

reject.form = rejectForm

const ApprovalController = { index, approve, reject }

export default ApprovalController