import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../wayfinder'
/**
* @see \App\Http\Controllers\OperationsController::importMethod
* @see app/Http/Controllers/OperationsController.php:389
* @route '/operations/master-data/items/import'
*/
export const importMethod = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: importMethod.url(options),
    method: 'post',
})

importMethod.definition = {
    methods: ["post"],
    url: '/operations/master-data/items/import',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\OperationsController::importMethod
* @see app/Http/Controllers/OperationsController.php:389
* @route '/operations/master-data/items/import'
*/
importMethod.url = (options?: RouteQueryOptions) => {
    return importMethod.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\OperationsController::importMethod
* @see app/Http/Controllers/OperationsController.php:389
* @route '/operations/master-data/items/import'
*/
importMethod.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: importMethod.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\OperationsController::importMethod
* @see app/Http/Controllers/OperationsController.php:389
* @route '/operations/master-data/items/import'
*/
const importMethodForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: importMethod.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\OperationsController::importMethod
* @see app/Http/Controllers/OperationsController.php:389
* @route '/operations/master-data/items/import'
*/
importMethodForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: importMethod.url(options),
    method: 'post',
})

importMethod.form = importMethodForm

/**
* @see \App\Http\Controllers\OperationsController::importTemplate
* @see app/Http/Controllers/OperationsController.php:465
* @route '/operations/master-data/items/import-template'
*/
export const importTemplate = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: importTemplate.url(options),
    method: 'get',
})

importTemplate.definition = {
    methods: ["get","head"],
    url: '/operations/master-data/items/import-template',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\OperationsController::importTemplate
* @see app/Http/Controllers/OperationsController.php:465
* @route '/operations/master-data/items/import-template'
*/
importTemplate.url = (options?: RouteQueryOptions) => {
    return importTemplate.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\OperationsController::importTemplate
* @see app/Http/Controllers/OperationsController.php:465
* @route '/operations/master-data/items/import-template'
*/
importTemplate.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: importTemplate.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\OperationsController::importTemplate
* @see app/Http/Controllers/OperationsController.php:465
* @route '/operations/master-data/items/import-template'
*/
importTemplate.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: importTemplate.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\OperationsController::importTemplate
* @see app/Http/Controllers/OperationsController.php:465
* @route '/operations/master-data/items/import-template'
*/
const importTemplateForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: importTemplate.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\OperationsController::importTemplate
* @see app/Http/Controllers/OperationsController.php:465
* @route '/operations/master-data/items/import-template'
*/
importTemplateForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: importTemplate.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\OperationsController::importTemplate
* @see app/Http/Controllers/OperationsController.php:465
* @route '/operations/master-data/items/import-template'
*/
importTemplateForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: importTemplate.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

importTemplate.form = importTemplateForm

const masterItems = {
    import: Object.assign(importMethod, importMethod),
    importTemplate: Object.assign(importTemplate, importTemplate),
}

export default masterItems