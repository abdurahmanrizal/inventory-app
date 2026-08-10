import { n as queryParams } from "./wayfinder-BrhwLpUM.js";
//#region resources/js/routes/index.ts
/**
* @see \Laravel\Fortify\Http\Controllers\AuthenticatedSessionController::login
* @see vendor/laravel/fortify/src/Http/Controllers/AuthenticatedSessionController.php:47
* @route '/login'
*/
var login = (options) => ({
	url: login.url(options),
	method: "get"
});
login.definition = {
	methods: ["get", "head"],
	url: "/login"
};
/**
* @see \Laravel\Fortify\Http\Controllers\AuthenticatedSessionController::login
* @see vendor/laravel/fortify/src/Http/Controllers/AuthenticatedSessionController.php:47
* @route '/login'
*/
login.url = (options) => {
	return login.definition.url + queryParams(options);
};
/**
* @see \Laravel\Fortify\Http\Controllers\AuthenticatedSessionController::login
* @see vendor/laravel/fortify/src/Http/Controllers/AuthenticatedSessionController.php:47
* @route '/login'
*/
login.get = (options) => ({
	url: login.url(options),
	method: "get"
});
/**
* @see \Laravel\Fortify\Http\Controllers\AuthenticatedSessionController::login
* @see vendor/laravel/fortify/src/Http/Controllers/AuthenticatedSessionController.php:47
* @route '/login'
*/
login.head = (options) => ({
	url: login.url(options),
	method: "head"
});
/**
* @see \Laravel\Fortify\Http\Controllers\AuthenticatedSessionController::login
* @see vendor/laravel/fortify/src/Http/Controllers/AuthenticatedSessionController.php:47
* @route '/login'
*/
var loginForm = (options) => ({
	action: login.url(options),
	method: "get"
});
/**
* @see \Laravel\Fortify\Http\Controllers\AuthenticatedSessionController::login
* @see vendor/laravel/fortify/src/Http/Controllers/AuthenticatedSessionController.php:47
* @route '/login'
*/
loginForm.get = (options) => ({
	action: login.url(options),
	method: "get"
});
/**
* @see \Laravel\Fortify\Http\Controllers\AuthenticatedSessionController::login
* @see vendor/laravel/fortify/src/Http/Controllers/AuthenticatedSessionController.php:47
* @route '/login'
*/
loginForm.head = (options) => ({
	action: login.url({ [options?.mergeQuery ? "mergeQuery" : "query"]: {
		_method: "HEAD",
		...options?.query ?? options?.mergeQuery ?? {}
	} }),
	method: "get"
});
login.form = loginForm;
/**
* @see \Laravel\Fortify\Http\Controllers\AuthenticatedSessionController::logout
* @see vendor/laravel/fortify/src/Http/Controllers/AuthenticatedSessionController.php:100
* @route '/logout'
*/
var logout = (options) => ({
	url: logout.url(options),
	method: "post"
});
logout.definition = {
	methods: ["post"],
	url: "/logout"
};
/**
* @see \Laravel\Fortify\Http\Controllers\AuthenticatedSessionController::logout
* @see vendor/laravel/fortify/src/Http/Controllers/AuthenticatedSessionController.php:100
* @route '/logout'
*/
logout.url = (options) => {
	return logout.definition.url + queryParams(options);
};
/**
* @see \Laravel\Fortify\Http\Controllers\AuthenticatedSessionController::logout
* @see vendor/laravel/fortify/src/Http/Controllers/AuthenticatedSessionController.php:100
* @route '/logout'
*/
logout.post = (options) => ({
	url: logout.url(options),
	method: "post"
});
/**
* @see \Laravel\Fortify\Http\Controllers\AuthenticatedSessionController::logout
* @see vendor/laravel/fortify/src/Http/Controllers/AuthenticatedSessionController.php:100
* @route '/logout'
*/
var logoutForm = (options) => ({
	action: logout.url(options),
	method: "post"
});
/**
* @see \Laravel\Fortify\Http\Controllers\AuthenticatedSessionController::logout
* @see vendor/laravel/fortify/src/Http/Controllers/AuthenticatedSessionController.php:100
* @route '/logout'
*/
logoutForm.post = (options) => ({
	action: logout.url(options),
	method: "post"
});
logout.form = logoutForm;
/**
* @see \Laravel\Fortify\Http\Controllers\RegisteredUserController::register
* @see vendor/laravel/fortify/src/Http/Controllers/RegisteredUserController.php:41
* @route '/register'
*/
var register = (options) => ({
	url: register.url(options),
	method: "get"
});
register.definition = {
	methods: ["get", "head"],
	url: "/register"
};
/**
* @see \Laravel\Fortify\Http\Controllers\RegisteredUserController::register
* @see vendor/laravel/fortify/src/Http/Controllers/RegisteredUserController.php:41
* @route '/register'
*/
register.url = (options) => {
	return register.definition.url + queryParams(options);
};
/**
* @see \Laravel\Fortify\Http\Controllers\RegisteredUserController::register
* @see vendor/laravel/fortify/src/Http/Controllers/RegisteredUserController.php:41
* @route '/register'
*/
register.get = (options) => ({
	url: register.url(options),
	method: "get"
});
/**
* @see \Laravel\Fortify\Http\Controllers\RegisteredUserController::register
* @see vendor/laravel/fortify/src/Http/Controllers/RegisteredUserController.php:41
* @route '/register'
*/
register.head = (options) => ({
	url: register.url(options),
	method: "head"
});
/**
* @see \Laravel\Fortify\Http\Controllers\RegisteredUserController::register
* @see vendor/laravel/fortify/src/Http/Controllers/RegisteredUserController.php:41
* @route '/register'
*/
var registerForm = (options) => ({
	action: register.url(options),
	method: "get"
});
/**
* @see \Laravel\Fortify\Http\Controllers\RegisteredUserController::register
* @see vendor/laravel/fortify/src/Http/Controllers/RegisteredUserController.php:41
* @route '/register'
*/
registerForm.get = (options) => ({
	action: register.url(options),
	method: "get"
});
/**
* @see \Laravel\Fortify\Http\Controllers\RegisteredUserController::register
* @see vendor/laravel/fortify/src/Http/Controllers/RegisteredUserController.php:41
* @route '/register'
*/
registerForm.head = (options) => ({
	action: register.url({ [options?.mergeQuery ? "mergeQuery" : "query"]: {
		_method: "HEAD",
		...options?.query ?? options?.mergeQuery ?? {}
	} }),
	method: "get"
});
register.form = registerForm;
/**
* @see routes/web.php:16
* @route '/'
*/
var home = (options) => ({
	url: home.url(options),
	method: "get"
});
home.definition = {
	methods: ["get", "head"],
	url: "/"
};
/**
* @see routes/web.php:16
* @route '/'
*/
home.url = (options) => {
	return home.definition.url + queryParams(options);
};
/**
* @see routes/web.php:16
* @route '/'
*/
home.get = (options) => ({
	url: home.url(options),
	method: "get"
});
/**
* @see routes/web.php:16
* @route '/'
*/
home.head = (options) => ({
	url: home.url(options),
	method: "head"
});
/**
* @see routes/web.php:16
* @route '/'
*/
var homeForm = (options) => ({
	action: home.url(options),
	method: "get"
});
/**
* @see routes/web.php:16
* @route '/'
*/
homeForm.get = (options) => ({
	action: home.url(options),
	method: "get"
});
/**
* @see routes/web.php:16
* @route '/'
*/
homeForm.head = (options) => ({
	action: home.url({ [options?.mergeQuery ? "mergeQuery" : "query"]: {
		_method: "HEAD",
		...options?.query ?? options?.mergeQuery ?? {}
	} }),
	method: "get"
});
home.form = homeForm;
/**
* @see \App\Http\Controllers\DashboardController::__invoke
* @see app/Http/Controllers/DashboardController.php:21
* @route '/dashboard'
*/
var dashboard = (options) => ({
	url: dashboard.url(options),
	method: "get"
});
dashboard.definition = {
	methods: ["get", "head"],
	url: "/dashboard"
};
/**
* @see \App\Http\Controllers\DashboardController::__invoke
* @see app/Http/Controllers/DashboardController.php:21
* @route '/dashboard'
*/
dashboard.url = (options) => {
	return dashboard.definition.url + queryParams(options);
};
/**
* @see \App\Http\Controllers\DashboardController::__invoke
* @see app/Http/Controllers/DashboardController.php:21
* @route '/dashboard'
*/
dashboard.get = (options) => ({
	url: dashboard.url(options),
	method: "get"
});
/**
* @see \App\Http\Controllers\DashboardController::__invoke
* @see app/Http/Controllers/DashboardController.php:21
* @route '/dashboard'
*/
dashboard.head = (options) => ({
	url: dashboard.url(options),
	method: "head"
});
/**
* @see \App\Http\Controllers\DashboardController::__invoke
* @see app/Http/Controllers/DashboardController.php:21
* @route '/dashboard'
*/
var dashboardForm = (options) => ({
	action: dashboard.url(options),
	method: "get"
});
/**
* @see \App\Http\Controllers\DashboardController::__invoke
* @see app/Http/Controllers/DashboardController.php:21
* @route '/dashboard'
*/
dashboardForm.get = (options) => ({
	action: dashboard.url(options),
	method: "get"
});
/**
* @see \App\Http\Controllers\DashboardController::__invoke
* @see app/Http/Controllers/DashboardController.php:21
* @route '/dashboard'
*/
dashboardForm.head = (options) => ({
	action: dashboard.url({ [options?.mergeQuery ? "mergeQuery" : "query"]: {
		_method: "HEAD",
		...options?.query ?? options?.mergeQuery ?? {}
	} }),
	method: "get"
});
dashboard.form = dashboardForm;
//#endregion
export { register as a, logout as i, home as n, login as r, dashboard as t };

//# sourceMappingURL=routes-Bb8kWkRa.js.map