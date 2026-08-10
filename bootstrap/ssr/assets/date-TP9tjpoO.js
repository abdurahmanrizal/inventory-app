//#region resources/js/lib/date.ts
var formatDateTime = (value) => {
	if (!value) return "-";
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return "-";
	return new Intl.DateTimeFormat("id-ID", {
		day: "numeric",
		month: "short",
		year: "numeric",
		hour: "2-digit",
		minute: "2-digit",
		hourCycle: "h23"
	}).format(date).replace(".", ":");
};
//#endregion
export { formatDateTime as t };

//# sourceMappingURL=date-TP9tjpoO.js.map