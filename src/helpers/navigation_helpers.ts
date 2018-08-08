/**
     * parse json safely
     *
     * @param {any} json should be a string
     * @return {any} false, undefined, or an object
     */
export function safelyParseJSON(json): any {
	// This function cannot be optimised, it's best to
	// keep it small!
	let parsed;
	try {
		parsed = JSON.parse(json);
	} catch (e) {
		return false;
	}
	return parsed; // Could be undefined!
}