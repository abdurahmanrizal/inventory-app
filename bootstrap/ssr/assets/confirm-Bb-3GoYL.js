import { n as queryParams } from "./wayfinder-BrhwLpUM.js";
//#region resources/js/routes/password/confirm/index.ts
/**
* @see \Laravel\Fortify\Http\Controllers\ConfirmablePasswordController::store
* @see vendor/laravel/fortify/src/Http/Controllers/ConfirmablePasswordController.php:51
* @route '/user/confirm-password'
*/
var store = (options) => ({
	url: store.url(options),
	method: "post"
});
store.definition = {
	methods: ["post"],
	url: "/user/confirm-password"
};
/**
* @see \Laravel\Fortify\Http\Controllers\ConfirmablePasswordController::store
* @see vendor/laravel/fortify/src/Http/Controllers/ConfirmablePasswordController.php:51
* @route '/user/confirm-password'
*/
store.url = (options) => {
	return store.definition.url + queryParams(options);
};
/**
* @see \Laravel\Fortify\Http\Controllers\ConfirmablePasswordController::store
* @see vendor/laravel/fortify/src/Http/Controllers/ConfirmablePasswordController.php:51
* @route '/user/confirm-password'
*/
store.post = (options) => ({
	url: store.url(options),
	method: "post"
});
/**
* @see \Laravel\Fortify\Http\Controllers\ConfirmablePasswordController::store
* @see vendor/laravel/fortify/src/Http/Controllers/ConfirmablePasswordController.php:51
* @route '/user/confirm-password'
*/
var storeForm = (options) => ({
	action: store.url(options),
	method: "post"
});
/**
* @see \Laravel\Fortify\Http\Controllers\ConfirmablePasswordController::store
* @see vendor/laravel/fortify/src/Http/Controllers/ConfirmablePasswordController.php:51
* @route '/user/confirm-password'
*/
storeForm.post = (options) => ({
	action: store.url(options),
	method: "post"
});
store.form = storeForm;
var confirm = { store: Object.assign(store, store) };
//#endregion
export { store as n, confirm as t };

//# sourceMappingURL=confirm-Bb-3GoYL.js.map