import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../wayfinder'
/**
* @see \App\Http\Controllers\InventoryReportController::__invoke
* @see app/Http/Controllers/InventoryReportController.php:17
* @route '/reports'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/reports',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\InventoryReportController::__invoke
* @see app/Http/Controllers/InventoryReportController.php:17
* @route '/reports'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\InventoryReportController::__invoke
* @see app/Http/Controllers/InventoryReportController.php:17
* @route '/reports'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\InventoryReportController::__invoke
* @see app/Http/Controllers/InventoryReportController.php:17
* @route '/reports'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\InventoryReportController::__invoke
* @see app/Http/Controllers/InventoryReportController.php:17
* @route '/reports'
*/
const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\InventoryReportController::__invoke
* @see app/Http/Controllers/InventoryReportController.php:17
* @route '/reports'
*/
indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\InventoryReportController::__invoke
* @see app/Http/Controllers/InventoryReportController.php:17
* @route '/reports'
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
* @see \App\Http\Controllers\InventoryReportController::exportMethod
* @see app/Http/Controllers/InventoryReportController.php:32
* @route '/reports/export/{format}'
*/
export const exportMethod = (args: { format: string | number } | [format: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: exportMethod.url(args, options),
    method: 'get',
})

exportMethod.definition = {
    methods: ["get","head"],
    url: '/reports/export/{format}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\InventoryReportController::exportMethod
* @see app/Http/Controllers/InventoryReportController.php:32
* @route '/reports/export/{format}'
*/
exportMethod.url = (args: { format: string | number } | [format: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { format: args }
    }

    if (Array.isArray(args)) {
        args = {
            format: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        format: args.format,
    }

    return exportMethod.definition.url
            .replace('{format}', parsedArgs.format.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\InventoryReportController::exportMethod
* @see app/Http/Controllers/InventoryReportController.php:32
* @route '/reports/export/{format}'
*/
exportMethod.get = (args: { format: string | number } | [format: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: exportMethod.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\InventoryReportController::exportMethod
* @see app/Http/Controllers/InventoryReportController.php:32
* @route '/reports/export/{format}'
*/
exportMethod.head = (args: { format: string | number } | [format: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: exportMethod.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\InventoryReportController::exportMethod
* @see app/Http/Controllers/InventoryReportController.php:32
* @route '/reports/export/{format}'
*/
const exportMethodForm = (args: { format: string | number } | [format: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: exportMethod.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\InventoryReportController::exportMethod
* @see app/Http/Controllers/InventoryReportController.php:32
* @route '/reports/export/{format}'
*/
exportMethodForm.get = (args: { format: string | number } | [format: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: exportMethod.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\InventoryReportController::exportMethod
* @see app/Http/Controllers/InventoryReportController.php:32
* @route '/reports/export/{format}'
*/
exportMethodForm.head = (args: { format: string | number } | [format: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: exportMethod.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

exportMethod.form = exportMethodForm

const reports = {
    index: Object.assign(index, index),
    export: Object.assign(exportMethod, exportMethod),
}

export default reports