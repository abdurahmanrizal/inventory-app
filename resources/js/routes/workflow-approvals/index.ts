import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../wayfinder'
/**
* @see \App\Http\Controllers\OperationsController::act
* @see app/Http/Controllers/OperationsController.php:683
* @route '/workflow-approvals/{approval}'
*/
export const act = (args: { approval: number | { id: number } } | [approval: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: act.url(args, options),
    method: 'post',
})

act.definition = {
    methods: ["post"],
    url: '/workflow-approvals/{approval}',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\OperationsController::act
* @see app/Http/Controllers/OperationsController.php:683
* @route '/workflow-approvals/{approval}'
*/
act.url = (args: { approval: number | { id: number } } | [approval: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
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

    return act.definition.url
            .replace('{approval}', parsedArgs.approval.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\OperationsController::act
* @see app/Http/Controllers/OperationsController.php:683
* @route '/workflow-approvals/{approval}'
*/
act.post = (args: { approval: number | { id: number } } | [approval: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: act.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\OperationsController::act
* @see app/Http/Controllers/OperationsController.php:683
* @route '/workflow-approvals/{approval}'
*/
const actForm = (args: { approval: number | { id: number } } | [approval: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: act.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\OperationsController::act
* @see app/Http/Controllers/OperationsController.php:683
* @route '/workflow-approvals/{approval}'
*/
actForm.post = (args: { approval: number | { id: number } } | [approval: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: act.url(args, options),
    method: 'post',
})

act.form = actForm

const workflowApprovals = {
    act: Object.assign(act, act),
}

export default workflowApprovals