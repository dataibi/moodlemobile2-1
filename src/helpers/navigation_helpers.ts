// (C) Copyright 2015 REVEAL
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

    /**
     * parse json safely
     *
     * @param {any} json should be a string
     * @return {any} false, undefined, or an object
     */
export function safelyParseJSON(json: any): any {
	// This function cannot be optimised, it's best to
	// Keep it small!
	let parsed;
	try {
		parsed = JSON.parse(json);
	} catch (e) {
		return false;
	}

	return parsed; // Could be undefined!
}
