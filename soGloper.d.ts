/*
	Copyright (c) 2025 Chung Lim Lee and Savvy Open
	All rights reserved.
*/





import * as React from 'react';

/**
 * A state management utility for React that allows groups to easily share states, 
 * manage namespaces, and optionally persist data in IndexedDB or localStorage.
 */





/**
 * Initializes a global state and returns the associated hook.
 *
 * Must be called before any component uses `useGloper()` with the same key.
 * This is typically done at the root level (e.g., in `App.tsx`). 
 *
 * @returns an optional string in snake_case format for symbolic reference usages
 */
 
export function createGloper(

	/** A unique name for the state, typically in the snake_case format `group_name`. 
	 *  If no underscore is used, the key is treated as either `"name"` or `"ungrouped_name"`.
	 */
	snakeCaseName: string,
	
	option?: {

		/** State value. */
		state?: any;
		
		/** Whether this state should be persisted (e.g., using IndexedDB or localStorage). */
		persist?: boolean;

		/** Any additional user-defined options. */
		[key: string]: unknown;
	}
	
): string; 

export {createGloper as createGlobal};





/**
 * A React hook that provides access to a globally shared state.
 *
 * Must be called **after** `createGloper()` with the same name.
 *
 * @param snakeCaseName
 *	- A unique name for the state, typically in the format "group_name". 
 *	- If no underscore is used, the key is treated as either "name" or "ungrouped_name".
 *
 * @returns A tuple containing:
 *   - The current state value.
 *   - A setter function to update the state (similar to React's useState).
 *
 * @example
 * const [count, setCount] = useGloper('main_counter');
 * setCount(prev => prev + 1);
 */
 
export function useGloper(snakeCaseName: string): [any, React.Dispatch<React.SetStateAction<any>>, boolean]; 

export {useGloper as useGlobal};





export declare const SoGloper: {

	/**
	* returns a group that manage states
	* @param snakeCaseName - A unique name identifying the group.
	* @returns a collection of custom state hooks and utilities to manage state.
	*/

	group(snakeCaseName: string): soHook;



	/**
	* Retrieves the current state value for a specific group and state name.
	* @param snakeCaseName - A name written in the form "group_name" (name without an underscore can have the form "name" or "ungrouped_name").
	* @returns The current state value.
	*/

	get(snakeCaseName: string): any;



	/**
	* Set the value for a specific group and state name.
	* @param snakeCaseName - A name written in the form "group_name" (name without an underscore can have the form "name" or "ungrouped_name").
	* @param value - any
	*/

	set(snakeCaseName: string, value: any): void;
	
	

	/**
	* Lists all state keys registered under the specified group or specify none for all groups.
	* @param groupName - The name of the group.
	* @param option - An object with `excludeSubgroups` properties.
	*/

	list(groupName?: string, option?: {excludeSubgroups: boolean}): void;



	/**
	* Resets a specific state by its snake_case name.
	* @param snakeCaseName - A name written in the form "group_name" (name without an underscore can have the form "name" or "ungrouped_name").
	* @param option - An object with `withValue` properties.
	*/

	reset(snakeCaseName: string, option?: { withValue: string }): void;



	/**
	* Resets all registered states across all groups.
	* @param option - An object with `withValue` properties.
	*/

	resetAll(option?: { withValue: string }): void;





	/**
	 * Local Storage direct handlings
	 */
	 
	localStorage: {

		/**
		 * Lists all state keys currently stored in `localStorage` under the soGloper namespace.
		 *
		 * @returns An array of state key names (e.g. "auth_token", "settings_theme").
		 */

		list(): string[];

		/**
		 * Removes all soGloper-related entries from `localStorage`.
		 *
		 * This does not affect in-memory state. It only removes the persisted state from the browser's `localStorage`.
		 */

		removeAll(): void;
	};





	/**
	 * IndexedDB direct handlings
	 */

	indexedDB: {

		/**
		 * Lists all state keys currently stored in `IndexedDB` under the soGloper namespace.
		 *
		 * @returns A promise that resolves to an array of state key names.
		 */

		list(): Promise<string[]>;

		/**
		 * Removes all soGloper-related entries from `IndexedDB`.
		 *
		 * This only removes the persisted values and does not modify in-memory state.
		 *
		 * @returns A promise that resolves once all keys are removed.
		 */

		removeAll(): Promise<void>;
	};





	/**
	 * For gloper configurations during startup
	 *
	 * This function is limited to a single run to preserve global state and namespace integrity.
	 */

	configure(settings: {

		/**
		* Specify localStorage/indexedDB as the storage backend to use for persistence.
		* Default: "localStorage"
		* @type {string}
		*/	
		persistStorage?: string,

		/**
		 * Application name or namespace used when storing persistent data.
		 * Default: "/" or the website's domain path name.
		 * @type {string}
		 */		
		persistAppName?: string,

		/**
		 * Enables automatic immutable updates with structural sharing.
		 * Default: true
		 * @type {boolean}
		 */
		autoImmutableUpdate?: boolean,

		/**
		 * Enables verbose debugging output in the console.
		 * Default: false
		 * @type {boolean}
		 */
		consoleDebug?: boolean
		
	}): void;
};





/**
 * A collection of custom state hooks, utilities that associated with a specific group.
 */

export type soHook = {

	/**
	 * Initializes a globally accessible state associated with a unique name.
	 *
	 * Must be called **before** any usage of `useGloper()` with the same name.
	 * Typically placed at the top level (e.g., in `App.tsx`) to ensure proper initialization.
	 *
	 * @param stateName - an unique state name within the group
	 * @param option - Optional configuration:
	 *   - `state`: Initial value of the state.
	 *   - `persist`: If true, the state is persisted via localStorage or IndexedDB.
	 *   - Additional metadata can be passed as needed.
	 *
	 * @returns A tuple: [current state, state setter function].
	 */
	
	createGloper(stateName: string, option?: {state?: any; persist?: boolean; [key: string]: unknown;}): [any, React.Dispatch<React.SetStateAction<any>>];



	/**
	 * Initializes a globally accessible state associated with a unique name.
	 *
	 * Must be called **before** any usage of `useGlobal()` with the same name.
	 * Typically placed at the top level (e.g., in `App.tsx`) to ensure proper initialization.
	 *
	 * @param stateName - an unique state name within the group
	 * @param option - Optional configuration:
	 *   - `state`: Initial value of the state.
	 *   - `persist`: If true, the state is persisted via localStorage or IndexedDB.
	 *   - Additional metadata can be passed as needed.
	 *
	 * @returns A tuple: [current state, state setter function].
	 */

	createGlobal(stateName: string, option?: {state?: any; persist?: boolean; [key: string]: unknown;}): [any, React.Dispatch<React.SetStateAction<any>>];



	/**
	 * Returns a globally accessible state associated with a unique name.
	 *
	 * Must be called **after** `createGloper()` with the same name.
	 *
	 * @param stateName - an unique state name within the group
	 * @returns A tuple: [current state, state setter function].
	 */
	useGloper(stateName: string): [any, React.Dispatch<React.SetStateAction<any>>];



	/**
	 * Returns a globally accessible state associated with a unique name.
	 *
	 * Must be called **after** `createGlobal()` with the same name.
	 *
	 * @param stateName - an unique state name within the group
	 * @returns A tuple: [current state, state setter function].
	 */

	useGlobal(stateName: string): [any, React.Dispatch<React.SetStateAction<any>>];


	
	/**
	* Retrieves the current state value for the given state name.
	* 
	* @param stateName - The name of the state to retrieve.
	* @returns The current value of the specified state.
	*/

	get(stateName: string): any;



	/**
	* Set the value for the given state name.
	* @param stateName - The name of the state to retrieve.
	* @param value - any
	*/

	set(snakeCaseName: string, value: any): void;
	
	

	/**
	* Lists all state keys registered under this group.
	* 
	* @param option - An object with `excludeSubgroups` properties.
	* @returns An array of state names, either as a string array or a Promise of one.
	*/

	list(option?: {excludeSubgroups: boolean}): Promise<string[]> | string[];



	/**
	* Resets the specific state associated with the given state name.
	* 
	* @param stateName - The name of the state to clear.
	* @param option - An object with `withValue` properties.
	*/

	reset(stateName: string, option: {withValue: string}): void;



	/**
	* Resets all state associated with this group.
	*/

	resetAll(): void;
};





/**
 * For debugging in developer console
 */
 
declare global {

	interface Window {

		SoGloper: any;
	}
}