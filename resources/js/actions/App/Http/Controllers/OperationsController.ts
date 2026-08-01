import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\OperationsController::index
* @see app/Http/Controllers/OperationsController.php:149
* @route '/operations/{module}'
*/
export const index = (args: { module: string | number } | [module: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(args, options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/operations/{module}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\OperationsController::index
* @see app/Http/Controllers/OperationsController.php:149
* @route '/operations/{module}'
*/
index.url = (args: { module: string | number } | [module: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { module: args }
    }

    if (Array.isArray(args)) {
        args = {
            module: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        module: args.module,
    }

    return index.definition.url
            .replace('{module}', parsedArgs.module.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\OperationsController::index
* @see app/Http/Controllers/OperationsController.php:149
* @route '/operations/{module}'
*/
index.get = (args: { module: string | number } | [module: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\OperationsController::index
* @see app/Http/Controllers/OperationsController.php:149
* @route '/operations/{module}'
*/
index.head = (args: { module: string | number } | [module: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\OperationsController::index
* @see app/Http/Controllers/OperationsController.php:149
* @route '/operations/{module}'
*/
const indexForm = (args: { module: string | number } | [module: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\OperationsController::index
* @see app/Http/Controllers/OperationsController.php:149
* @route '/operations/{module}'
*/
indexForm.get = (args: { module: string | number } | [module: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\OperationsController::index
* @see app/Http/Controllers/OperationsController.php:149
* @route '/operations/{module}'
*/
indexForm.head = (args: { module: string | number } | [module: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

index.form = indexForm

/**
* @see \App\Http\Controllers\OperationsController::stockRequests
* @see app/Http/Controllers/OperationsController.php:73
* @route '/stock-requests'
*/
export const stockRequests = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: stockRequests.url(options),
    method: 'get',
})

stockRequests.definition = {
    methods: ["get","head"],
    url: '/stock-requests',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\OperationsController::stockRequests
* @see app/Http/Controllers/OperationsController.php:73
* @route '/stock-requests'
*/
stockRequests.url = (options?: RouteQueryOptions) => {
    return stockRequests.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\OperationsController::stockRequests
* @see app/Http/Controllers/OperationsController.php:73
* @route '/stock-requests'
*/
stockRequests.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: stockRequests.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\OperationsController::stockRequests
* @see app/Http/Controllers/OperationsController.php:73
* @route '/stock-requests'
*/
stockRequests.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: stockRequests.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\OperationsController::stockRequests
* @see app/Http/Controllers/OperationsController.php:73
* @route '/stock-requests'
*/
const stockRequestsForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: stockRequests.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\OperationsController::stockRequests
* @see app/Http/Controllers/OperationsController.php:73
* @route '/stock-requests'
*/
stockRequestsForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: stockRequests.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\OperationsController::stockRequests
* @see app/Http/Controllers/OperationsController.php:73
* @route '/stock-requests'
*/
stockRequestsForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: stockRequests.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

stockRequests.form = stockRequestsForm

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

/**
* @see \App\Http\Controllers\OperationsController::supplier
* @see app/Http/Controllers/OperationsController.php:299
* @route '/operations/master-data/suppliers'
*/
export const supplier = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: supplier.url(options),
    method: 'post',
})

supplier.definition = {
    methods: ["post"],
    url: '/operations/master-data/suppliers',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\OperationsController::supplier
* @see app/Http/Controllers/OperationsController.php:299
* @route '/operations/master-data/suppliers'
*/
supplier.url = (options?: RouteQueryOptions) => {
    return supplier.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\OperationsController::supplier
* @see app/Http/Controllers/OperationsController.php:299
* @route '/operations/master-data/suppliers'
*/
supplier.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: supplier.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\OperationsController::supplier
* @see app/Http/Controllers/OperationsController.php:299
* @route '/operations/master-data/suppliers'
*/
const supplierForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: supplier.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\OperationsController::supplier
* @see app/Http/Controllers/OperationsController.php:299
* @route '/operations/master-data/suppliers'
*/
supplierForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: supplier.url(options),
    method: 'post',
})

supplier.form = supplierForm

/**
* @see \App\Http\Controllers\OperationsController::uom
* @see app/Http/Controllers/OperationsController.php:317
* @route '/operations/master-data/uoms'
*/
export const uom = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: uom.url(options),
    method: 'post',
})

uom.definition = {
    methods: ["post"],
    url: '/operations/master-data/uoms',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\OperationsController::uom
* @see app/Http/Controllers/OperationsController.php:317
* @route '/operations/master-data/uoms'
*/
uom.url = (options?: RouteQueryOptions) => {
    return uom.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\OperationsController::uom
* @see app/Http/Controllers/OperationsController.php:317
* @route '/operations/master-data/uoms'
*/
uom.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: uom.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\OperationsController::uom
* @see app/Http/Controllers/OperationsController.php:317
* @route '/operations/master-data/uoms'
*/
const uomForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: uom.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\OperationsController::uom
* @see app/Http/Controllers/OperationsController.php:317
* @route '/operations/master-data/uoms'
*/
uomForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: uom.url(options),
    method: 'post',
})

uom.form = uomForm

/**
* @see \App\Http\Controllers\OperationsController::location
* @see app/Http/Controllers/OperationsController.php:335
* @route '/operations/master-data/locations'
*/
export const location = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: location.url(options),
    method: 'post',
})

location.definition = {
    methods: ["post"],
    url: '/operations/master-data/locations',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\OperationsController::location
* @see app/Http/Controllers/OperationsController.php:335
* @route '/operations/master-data/locations'
*/
location.url = (options?: RouteQueryOptions) => {
    return location.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\OperationsController::location
* @see app/Http/Controllers/OperationsController.php:335
* @route '/operations/master-data/locations'
*/
location.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: location.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\OperationsController::location
* @see app/Http/Controllers/OperationsController.php:335
* @route '/operations/master-data/locations'
*/
const locationForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: location.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\OperationsController::location
* @see app/Http/Controllers/OperationsController.php:335
* @route '/operations/master-data/locations'
*/
locationForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: location.url(options),
    method: 'post',
})

location.form = locationForm

/**
* @see \App\Http\Controllers\OperationsController::item
* @see app/Http/Controllers/OperationsController.php:353
* @route '/operations/master-data/items'
*/
export const item = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: item.url(options),
    method: 'post',
})

item.definition = {
    methods: ["post"],
    url: '/operations/master-data/items',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\OperationsController::item
* @see app/Http/Controllers/OperationsController.php:353
* @route '/operations/master-data/items'
*/
item.url = (options?: RouteQueryOptions) => {
    return item.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\OperationsController::item
* @see app/Http/Controllers/OperationsController.php:353
* @route '/operations/master-data/items'
*/
item.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: item.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\OperationsController::item
* @see app/Http/Controllers/OperationsController.php:353
* @route '/operations/master-data/items'
*/
const itemForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: item.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\OperationsController::item
* @see app/Http/Controllers/OperationsController.php:353
* @route '/operations/master-data/items'
*/
itemForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: item.url(options),
    method: 'post',
})

item.form = itemForm

/**
* @see \App\Http\Controllers\OperationsController::importItems
* @see app/Http/Controllers/OperationsController.php:373
* @route '/operations/master-data/items/import'
*/
export const importItems = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: importItems.url(options),
    method: 'post',
})

importItems.definition = {
    methods: ["post"],
    url: '/operations/master-data/items/import',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\OperationsController::importItems
* @see app/Http/Controllers/OperationsController.php:373
* @route '/operations/master-data/items/import'
*/
importItems.url = (options?: RouteQueryOptions) => {
    return importItems.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\OperationsController::importItems
* @see app/Http/Controllers/OperationsController.php:373
* @route '/operations/master-data/items/import'
*/
importItems.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: importItems.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\OperationsController::importItems
* @see app/Http/Controllers/OperationsController.php:373
* @route '/operations/master-data/items/import'
*/
const importItemsForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: importItems.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\OperationsController::importItems
* @see app/Http/Controllers/OperationsController.php:373
* @route '/operations/master-data/items/import'
*/
importItemsForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: importItems.url(options),
    method: 'post',
})

importItems.form = importItemsForm

/**
* @see \App\Http\Controllers\OperationsController::itemImportTemplate
* @see app/Http/Controllers/OperationsController.php:449
* @route '/operations/master-data/items/import-template'
*/
export const itemImportTemplate = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: itemImportTemplate.url(options),
    method: 'get',
})

itemImportTemplate.definition = {
    methods: ["get","head"],
    url: '/operations/master-data/items/import-template',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\OperationsController::itemImportTemplate
* @see app/Http/Controllers/OperationsController.php:449
* @route '/operations/master-data/items/import-template'
*/
itemImportTemplate.url = (options?: RouteQueryOptions) => {
    return itemImportTemplate.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\OperationsController::itemImportTemplate
* @see app/Http/Controllers/OperationsController.php:449
* @route '/operations/master-data/items/import-template'
*/
itemImportTemplate.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: itemImportTemplate.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\OperationsController::itemImportTemplate
* @see app/Http/Controllers/OperationsController.php:449
* @route '/operations/master-data/items/import-template'
*/
itemImportTemplate.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: itemImportTemplate.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\OperationsController::itemImportTemplate
* @see app/Http/Controllers/OperationsController.php:449
* @route '/operations/master-data/items/import-template'
*/
const itemImportTemplateForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: itemImportTemplate.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\OperationsController::itemImportTemplate
* @see app/Http/Controllers/OperationsController.php:449
* @route '/operations/master-data/items/import-template'
*/
itemImportTemplateForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: itemImportTemplate.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\OperationsController::itemImportTemplate
* @see app/Http/Controllers/OperationsController.php:449
* @route '/operations/master-data/items/import-template'
*/
itemImportTemplateForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: itemImportTemplate.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

itemImportTemplate.form = itemImportTemplateForm

/**
* @see \App\Http\Controllers\OperationsController::updateSupplier
* @see app/Http/Controllers/OperationsController.php:308
* @route '/operations/master-data/suppliers/{supplier}'
*/
export const updateSupplier = (args: { supplier: number | { id: number } } | [supplier: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: updateSupplier.url(args, options),
    method: 'put',
})

updateSupplier.definition = {
    methods: ["put"],
    url: '/operations/master-data/suppliers/{supplier}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\OperationsController::updateSupplier
* @see app/Http/Controllers/OperationsController.php:308
* @route '/operations/master-data/suppliers/{supplier}'
*/
updateSupplier.url = (args: { supplier: number | { id: number } } | [supplier: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { supplier: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { supplier: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            supplier: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        supplier: typeof args.supplier === 'object'
        ? args.supplier.id
        : args.supplier,
    }

    return updateSupplier.definition.url
            .replace('{supplier}', parsedArgs.supplier.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\OperationsController::updateSupplier
* @see app/Http/Controllers/OperationsController.php:308
* @route '/operations/master-data/suppliers/{supplier}'
*/
updateSupplier.put = (args: { supplier: number | { id: number } } | [supplier: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: updateSupplier.url(args, options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\OperationsController::updateSupplier
* @see app/Http/Controllers/OperationsController.php:308
* @route '/operations/master-data/suppliers/{supplier}'
*/
const updateSupplierForm = (args: { supplier: number | { id: number } } | [supplier: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: updateSupplier.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\OperationsController::updateSupplier
* @see app/Http/Controllers/OperationsController.php:308
* @route '/operations/master-data/suppliers/{supplier}'
*/
updateSupplierForm.put = (args: { supplier: number | { id: number } } | [supplier: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: updateSupplier.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

updateSupplier.form = updateSupplierForm

/**
* @see \App\Http\Controllers\OperationsController::updateUom
* @see app/Http/Controllers/OperationsController.php:326
* @route '/operations/master-data/uoms/{uom}'
*/
export const updateUom = (args: { uom: number | { id: number } } | [uom: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: updateUom.url(args, options),
    method: 'put',
})

updateUom.definition = {
    methods: ["put"],
    url: '/operations/master-data/uoms/{uom}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\OperationsController::updateUom
* @see app/Http/Controllers/OperationsController.php:326
* @route '/operations/master-data/uoms/{uom}'
*/
updateUom.url = (args: { uom: number | { id: number } } | [uom: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { uom: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { uom: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            uom: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        uom: typeof args.uom === 'object'
        ? args.uom.id
        : args.uom,
    }

    return updateUom.definition.url
            .replace('{uom}', parsedArgs.uom.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\OperationsController::updateUom
* @see app/Http/Controllers/OperationsController.php:326
* @route '/operations/master-data/uoms/{uom}'
*/
updateUom.put = (args: { uom: number | { id: number } } | [uom: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: updateUom.url(args, options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\OperationsController::updateUom
* @see app/Http/Controllers/OperationsController.php:326
* @route '/operations/master-data/uoms/{uom}'
*/
const updateUomForm = (args: { uom: number | { id: number } } | [uom: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: updateUom.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\OperationsController::updateUom
* @see app/Http/Controllers/OperationsController.php:326
* @route '/operations/master-data/uoms/{uom}'
*/
updateUomForm.put = (args: { uom: number | { id: number } } | [uom: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: updateUom.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

updateUom.form = updateUomForm

/**
* @see \App\Http\Controllers\OperationsController::updateLocation
* @see app/Http/Controllers/OperationsController.php:344
* @route '/operations/master-data/locations/{location}'
*/
export const updateLocation = (args: { location: number | { id: number } } | [location: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: updateLocation.url(args, options),
    method: 'put',
})

updateLocation.definition = {
    methods: ["put"],
    url: '/operations/master-data/locations/{location}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\OperationsController::updateLocation
* @see app/Http/Controllers/OperationsController.php:344
* @route '/operations/master-data/locations/{location}'
*/
updateLocation.url = (args: { location: number | { id: number } } | [location: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { location: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { location: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            location: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        location: typeof args.location === 'object'
        ? args.location.id
        : args.location,
    }

    return updateLocation.definition.url
            .replace('{location}', parsedArgs.location.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\OperationsController::updateLocation
* @see app/Http/Controllers/OperationsController.php:344
* @route '/operations/master-data/locations/{location}'
*/
updateLocation.put = (args: { location: number | { id: number } } | [location: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: updateLocation.url(args, options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\OperationsController::updateLocation
* @see app/Http/Controllers/OperationsController.php:344
* @route '/operations/master-data/locations/{location}'
*/
const updateLocationForm = (args: { location: number | { id: number } } | [location: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: updateLocation.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\OperationsController::updateLocation
* @see app/Http/Controllers/OperationsController.php:344
* @route '/operations/master-data/locations/{location}'
*/
updateLocationForm.put = (args: { location: number | { id: number } } | [location: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: updateLocation.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

updateLocation.form = updateLocationForm

/**
* @see \App\Http\Controllers\OperationsController::updateItem
* @see app/Http/Controllers/OperationsController.php:363
* @route '/operations/master-data/items/{item}'
*/
export const updateItem = (args: { item: number | { id: number } } | [item: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: updateItem.url(args, options),
    method: 'put',
})

updateItem.definition = {
    methods: ["put"],
    url: '/operations/master-data/items/{item}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\OperationsController::updateItem
* @see app/Http/Controllers/OperationsController.php:363
* @route '/operations/master-data/items/{item}'
*/
updateItem.url = (args: { item: number | { id: number } } | [item: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { item: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { item: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            item: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        item: typeof args.item === 'object'
        ? args.item.id
        : args.item,
    }

    return updateItem.definition.url
            .replace('{item}', parsedArgs.item.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\OperationsController::updateItem
* @see app/Http/Controllers/OperationsController.php:363
* @route '/operations/master-data/items/{item}'
*/
updateItem.put = (args: { item: number | { id: number } } | [item: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: updateItem.url(args, options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\OperationsController::updateItem
* @see app/Http/Controllers/OperationsController.php:363
* @route '/operations/master-data/items/{item}'
*/
const updateItemForm = (args: { item: number | { id: number } } | [item: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: updateItem.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\OperationsController::updateItem
* @see app/Http/Controllers/OperationsController.php:363
* @route '/operations/master-data/items/{item}'
*/
updateItemForm.put = (args: { item: number | { id: number } } | [item: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: updateItem.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

updateItem.form = updateItemForm

/**
* @see \App\Http\Controllers\OperationsController::stockRequest
* @see app/Http/Controllers/OperationsController.php:460
* @route '/operations/fulfillment/requests'
*/
export const stockRequest = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: stockRequest.url(options),
    method: 'post',
})

stockRequest.definition = {
    methods: ["post"],
    url: '/operations/fulfillment/requests',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\OperationsController::stockRequest
* @see app/Http/Controllers/OperationsController.php:460
* @route '/operations/fulfillment/requests'
*/
stockRequest.url = (options?: RouteQueryOptions) => {
    return stockRequest.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\OperationsController::stockRequest
* @see app/Http/Controllers/OperationsController.php:460
* @route '/operations/fulfillment/requests'
*/
stockRequest.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: stockRequest.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\OperationsController::stockRequest
* @see app/Http/Controllers/OperationsController.php:460
* @route '/operations/fulfillment/requests'
*/
const stockRequestForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: stockRequest.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\OperationsController::stockRequest
* @see app/Http/Controllers/OperationsController.php:460
* @route '/operations/fulfillment/requests'
*/
stockRequestForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: stockRequest.url(options),
    method: 'post',
})

stockRequest.form = stockRequestForm

/**
* @see \App\Http\Controllers\OperationsController::prepareStockRequest
* @see app/Http/Controllers/OperationsController.php:521
* @route '/operations/fulfillment/requests/{stockRequest}/prepare'
*/
export const prepareStockRequest = (args: { stockRequest: number | { id: number } } | [stockRequest: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: prepareStockRequest.url(args, options),
    method: 'post',
})

prepareStockRequest.definition = {
    methods: ["post"],
    url: '/operations/fulfillment/requests/{stockRequest}/prepare',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\OperationsController::prepareStockRequest
* @see app/Http/Controllers/OperationsController.php:521
* @route '/operations/fulfillment/requests/{stockRequest}/prepare'
*/
prepareStockRequest.url = (args: { stockRequest: number | { id: number } } | [stockRequest: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
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

    return prepareStockRequest.definition.url
            .replace('{stockRequest}', parsedArgs.stockRequest.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\OperationsController::prepareStockRequest
* @see app/Http/Controllers/OperationsController.php:521
* @route '/operations/fulfillment/requests/{stockRequest}/prepare'
*/
prepareStockRequest.post = (args: { stockRequest: number | { id: number } } | [stockRequest: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: prepareStockRequest.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\OperationsController::prepareStockRequest
* @see app/Http/Controllers/OperationsController.php:521
* @route '/operations/fulfillment/requests/{stockRequest}/prepare'
*/
const prepareStockRequestForm = (args: { stockRequest: number | { id: number } } | [stockRequest: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: prepareStockRequest.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\OperationsController::prepareStockRequest
* @see app/Http/Controllers/OperationsController.php:521
* @route '/operations/fulfillment/requests/{stockRequest}/prepare'
*/
prepareStockRequestForm.post = (args: { stockRequest: number | { id: number } } | [stockRequest: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: prepareStockRequest.url(args, options),
    method: 'post',
})

prepareStockRequest.form = prepareStockRequestForm

/**
* @see \App\Http\Controllers\OperationsController::delivery
* @see app/Http/Controllers/OperationsController.php:530
* @route '/operations/fulfillment/deliveries'
*/
export const delivery = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: delivery.url(options),
    method: 'post',
})

delivery.definition = {
    methods: ["post"],
    url: '/operations/fulfillment/deliveries',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\OperationsController::delivery
* @see app/Http/Controllers/OperationsController.php:530
* @route '/operations/fulfillment/deliveries'
*/
delivery.url = (options?: RouteQueryOptions) => {
    return delivery.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\OperationsController::delivery
* @see app/Http/Controllers/OperationsController.php:530
* @route '/operations/fulfillment/deliveries'
*/
delivery.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: delivery.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\OperationsController::delivery
* @see app/Http/Controllers/OperationsController.php:530
* @route '/operations/fulfillment/deliveries'
*/
const deliveryForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: delivery.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\OperationsController::delivery
* @see app/Http/Controllers/OperationsController.php:530
* @route '/operations/fulfillment/deliveries'
*/
deliveryForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: delivery.url(options),
    method: 'post',
})

delivery.form = deliveryForm

/**
* @see \App\Http\Controllers\OperationsController::receipt
* @see app/Http/Controllers/OperationsController.php:549
* @route '/operations/fulfillment/receipts'
*/
export const receipt = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: receipt.url(options),
    method: 'post',
})

receipt.definition = {
    methods: ["post"],
    url: '/operations/fulfillment/receipts',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\OperationsController::receipt
* @see app/Http/Controllers/OperationsController.php:549
* @route '/operations/fulfillment/receipts'
*/
receipt.url = (options?: RouteQueryOptions) => {
    return receipt.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\OperationsController::receipt
* @see app/Http/Controllers/OperationsController.php:549
* @route '/operations/fulfillment/receipts'
*/
receipt.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: receipt.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\OperationsController::receipt
* @see app/Http/Controllers/OperationsController.php:549
* @route '/operations/fulfillment/receipts'
*/
const receiptForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: receipt.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\OperationsController::receipt
* @see app/Http/Controllers/OperationsController.php:549
* @route '/operations/fulfillment/receipts'
*/
receiptForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: receipt.url(options),
    method: 'post',
})

receipt.form = receiptForm

/**
* @see \App\Http\Controllers\OperationsController::adjustment
* @see app/Http/Controllers/OperationsController.php:567
* @route '/operations/inventory-control/adjustments'
*/
export const adjustment = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: adjustment.url(options),
    method: 'post',
})

adjustment.definition = {
    methods: ["post"],
    url: '/operations/inventory-control/adjustments',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\OperationsController::adjustment
* @see app/Http/Controllers/OperationsController.php:567
* @route '/operations/inventory-control/adjustments'
*/
adjustment.url = (options?: RouteQueryOptions) => {
    return adjustment.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\OperationsController::adjustment
* @see app/Http/Controllers/OperationsController.php:567
* @route '/operations/inventory-control/adjustments'
*/
adjustment.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: adjustment.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\OperationsController::adjustment
* @see app/Http/Controllers/OperationsController.php:567
* @route '/operations/inventory-control/adjustments'
*/
const adjustmentForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: adjustment.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\OperationsController::adjustment
* @see app/Http/Controllers/OperationsController.php:567
* @route '/operations/inventory-control/adjustments'
*/
adjustmentForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: adjustment.url(options),
    method: 'post',
})

adjustment.form = adjustmentForm

/**
* @see \App\Http\Controllers\OperationsController::opname
* @see app/Http/Controllers/OperationsController.php:610
* @route '/operations/inventory-control/opnames'
*/
export const opname = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: opname.url(options),
    method: 'post',
})

opname.definition = {
    methods: ["post"],
    url: '/operations/inventory-control/opnames',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\OperationsController::opname
* @see app/Http/Controllers/OperationsController.php:610
* @route '/operations/inventory-control/opnames'
*/
opname.url = (options?: RouteQueryOptions) => {
    return opname.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\OperationsController::opname
* @see app/Http/Controllers/OperationsController.php:610
* @route '/operations/inventory-control/opnames'
*/
opname.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: opname.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\OperationsController::opname
* @see app/Http/Controllers/OperationsController.php:610
* @route '/operations/inventory-control/opnames'
*/
const opnameForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: opname.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\OperationsController::opname
* @see app/Http/Controllers/OperationsController.php:610
* @route '/operations/inventory-control/opnames'
*/
opnameForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: opname.url(options),
    method: 'post',
})

opname.form = opnameForm

/**
* @see \App\Http\Controllers\OperationsController::approval
* @see app/Http/Controllers/OperationsController.php:656
* @route '/workflow-approvals/{approval}'
*/
export const approval = (args: { approval: number | { id: number } } | [approval: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: approval.url(args, options),
    method: 'post',
})

approval.definition = {
    methods: ["post"],
    url: '/workflow-approvals/{approval}',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\OperationsController::approval
* @see app/Http/Controllers/OperationsController.php:656
* @route '/workflow-approvals/{approval}'
*/
approval.url = (args: { approval: number | { id: number } } | [approval: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { approval: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { approval: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            approval: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        approval: typeof args.approval === 'object'
        ? args.approval.id
        : args.approval,
    }

    return approval.definition.url
            .replace('{approval}', parsedArgs.approval.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\OperationsController::approval
* @see app/Http/Controllers/OperationsController.php:656
* @route '/workflow-approvals/{approval}'
*/
approval.post = (args: { approval: number | { id: number } } | [approval: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: approval.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\OperationsController::approval
* @see app/Http/Controllers/OperationsController.php:656
* @route '/workflow-approvals/{approval}'
*/
const approvalForm = (args: { approval: number | { id: number } } | [approval: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: approval.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\OperationsController::approval
* @see app/Http/Controllers/OperationsController.php:656
* @route '/workflow-approvals/{approval}'
*/
approvalForm.post = (args: { approval: number | { id: number } } | [approval: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: approval.url(args, options),
    method: 'post',
})

approval.form = approvalForm

const OperationsController = { index, stockRequests, deliveryNote, supplier, uom, location, item, importItems, itemImportTemplate, updateSupplier, updateUom, updateLocation, updateItem, stockRequest, prepareStockRequest, delivery, receipt, adjustment, opname, approval }

export default OperationsController