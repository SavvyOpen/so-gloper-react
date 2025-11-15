/*
	Copyright (c) 2025 Chung Lim Lee and Savvy Open
	All rights reserved.
*/





// SOGLOPER - GLOBAL SYSTEM WITH PERSISTANCE

import {useState, useSyncExternalStore} from 'react'





// MAIN: soGloper FOR REACT

const soGloper = {};



// default autoImmutableUpdate is on to target reactive (immer style alike)
// *** turn this off, if required non-reactive reference coding

let autoImmutableUpdate = true;



// *** default to using localStorage; set it false for localStorage

let useIndexedDB = false;



// *** for differentiate each app's persist data (required to set this, when more than one app uses soGloper on the same origin)

let persistAppName = window.location.pathname;	// default to domain path name (*** can be set to custom the name)



// enable to debug using Gloper in developer console (default false)

const consoleDebug = function() {

	window.SoGloper = soGloper;
}



// configuration for soGloper

let configured = false;

soGloper.configure = function(settings = {}) {

	if (configured)
		throw new Error('Gloper.configure is limited to a single run to preserve global state and namespace integrity.');
	
	
	// for persist storage type
	
	if (typeof settings.persistStorage === 'string')
		var persistStorage = settings.persistStorage.toLowerCase();
	
	if (persistStorage === 'indexeddb')
		useIndexedDB = true;
	else
		useIndexedDB = false;



	// for persist app name
	
	const _persistAppName = settings.persistAppName;
	
	if (typeof _persistAppName === 'string' && _persistAppName !== '')
		persistAppName = _persistAppName;



	// for auto immutable update
	
	const ___autoImmutableUpdate = settings.autoImmutableUpdate;
	
	if (typeof ___autoImmutableUpdate === 'boolean')
		 autoImmutableUpdate = ___autoImmutableUpdate;
		 
		 

	// for console debug

	const _consoleDebug = settings.consoleDebug;
	
	if (_consoleDebug === true)
		consoleDebug();


	
	configured = true;
}
 




// PRIVATE API

const nameDivider = '_.--._';
const prefix = '-+-SoGloper' + nameDivider;	// *** to distinguish it from normal soStorage keys in indexedDb / localStorage
const store = {};



// creates a custom state hook scoped to a specific component

const setupHook = function(stateName, state, groupName, option) {

	// get full name (*** to ensure soGloper has unique names based on persistAppName and groupName (also soStorage.js can be used side by side with soGloper)
	
	var fullName = soGloper.fullName(groupName, stateName);


	
	// check full name is in store, if not then mark it with init = false
	
	if (fullName in store === false)
		store[fullName] = {init: false, persist: option.persist};
	else
		throw new Error('already initialized: ' + groupName + '_' + stateName);



	// setup data in store

	store[fullName]._state_ = state;	// save the state obtain from register(object)
	newData(fullName, '');	// *** set temporarily blank based on types for better compatibilities [], {}, 0, '', ... or rely on "ready" properties
}

const initHook = function(fullName) {	// for defer/lazy load

	const gloper = store[fullName];

	if (gloper.init === false) {

		if (gloper.persist) {	// if persist present then always load any of its persist "data" in indexedDB/localStorage

			if (useIndexedDB) {
			
				store[fullName].ready = false;

				return soStorage.get(fullName).then((persistData) => {	// *** for initHook.then in get and set

					if (persistData === undefined) {	// on fail get, use the initial defined state and set to IndexedDB

						return processInitialState(gloper._state_, gloper);		
					}
					
					else {
					
						store[fullName].setData(persistData, {skipPersistWrite: true});	// *** skip rewriting back to persist while loading from it
						store[fullName].ready = true;	// *** indicate async data is ready
						
						store[fullName].init = true;
						
						return persistData;
					}
				});
			}

			else {	// use LocalStorage

				store[fullName].init = true;
				
				var persistData = localStorage.getItem(fullName);

				if (persistData !== null) {	// has matching fullName as key

					// *** aid string-based localStorage to restore types
					
					if (persistData === 'undefined')	// undefined
						store[fullName].setData(undefined, {skipPersistWrite: true});	// *** skip rewriting back to persist while loading from it
					
					else if (persistData === 'NaN')	// NaN
						store[fullName].setData(NaN, {skipPersistWrite: true});

					else	// boolean, null, number, string, array, object (JSON.parse can parse these correctly from JSON.stringify)
						store[fullName].setData(JSON.parse(persistData), {skipPersistWrite: true});

				}
				
				else {	// on fail get, use the initial defined state and set to LocalStorage

					return processInitialState(gloper._state_, gloper);
				}
			}

		}			

		else {	// if no persist present for this state, load its initial state (originally defined from register(object))
		
			return processInitialState(gloper._state_, gloper);
		}
	}

}

const processInitialState = function(initState, gloper) {	// call by initHook for defer/lazy load the initial state only

	if (typeof initState === 'function') {	// is a state function
				
		if (initState.constructor.name === 'AsyncFunction') {

			gloper.ready = false;

			return initState().then((state) => {
			
				gloper.initData = state;
				gloper.setData(state);

				gloper.init = true;
				gloper.ready = true;	// *** async result ready
			});

		}
		
		else {	// synchronous function

			gloper.init = true;	// *** for synchronous, must set gloper.init = true first, because .setData() has listeners that will self call multiple times
			gloper.setData(initState());
		}
	}

	else {	// non-function states

		gloper.init = true;
		gloper.setData(initState);
	}
}

const useHook = function(stateName, state, groupName, option) {

	// get full name (*** to ensure soGloper has unique names based on persistAppName and groupName (also soStorage.js can be used side by side with soGloper)
	
	var fullName = soGloper.fullName(groupName, stateName);
	var sData = subscribeData(fullName);	// *** "sdata" = subscribed data by fullName


	// return the React hook
	
	return [sData, store[fullName].setReactData, {ready: store[fullName].ready}];
}



// immutable update for object and array

function _autoImmutableUpdate(value) {	// *** for setData() and _.set(), but this loses any non-reactive reference due to a new reference

	if (autoImmutableUpdate) {	// mode = on
	
		if (Object.prototype.toString.call(value) === '[object Object]')
			return {...value};
			
		else if (Object.prototype.toString.call(value) === '[object Array]')
			return [...value];
			
		else	// unsupported type
			return value;
	}
	
	else {	// mode = off
	
		return value;
	}
}


 
// create new data by fullName to put in the global store
							
function newData(fullName, data) {

	const listeners = new Set();
	

	function setData(userData) {	// normal mode
	
		_setData(userData, {_reactMode: false}); 
	}

	function setReactData(userData) {	// for React mode
	
		_setData(userData, {_reactMode: true});
	}
	
	function _setData(userData, option = {}) {

		const gloper = store[fullName];



		// update gloper and update its subscribers

		if (option._reactMode) {
		
			if (typeof userData === 'function')
				data = _autoImmutableUpdate(userData(data));
			else
				data = _autoImmutableUpdate(userData);
				
		}
		
		else {	// normal mode
		
			data = userData;
		}

		listeners.forEach((func) => func());
		gloper.currentData = data;



		// if any then update its respective persist
		
		if (option.skipPersistWrite !== true && gloper.persist) {

			if (useIndexedDB) {
			
				soStorage.set(fullName, data);
			}	
		
			else { 	// use localStorage

				// *** Aid JSON.stringify to produce compatible string for JSON.parse to parse without errors; preserve types with string-based localStorage

				if (data === 'undefined' || data === 'null' || data === 'true' || data === 'false' || data === 'NaN')	// string with reserved typed words
					localStorage.setItem(fullName, '"' + data + '"');
				
				else if (typeof data === 'number' && isNaN(data))
					localStorage.setItem(fullName, 'NaN');	// JSON.stringify(NaN) returns null, not NaN
				
				else	// undefined, null, boolean, number, string, array, object
					localStorage.setItem(fullName, JSON.stringify(data));
					
			}
		}
	}



	function subscribe(listener) {

		listeners.add(listener);
		
		return () => listeners.delete(listener);	// unsubscribe
	}

	function getSnapShot() {

		return data;
	}



	// setup record in global store object
	
	store[fullName] = {...store[fullName], initData: data, currentData: data, setData, setReactData, subscribe, getSnapShot};
}



// create a subscribeData by fullName to put in the global store

function subscribeData(fullName) {

	const pointer = store[fullName];
	const sdata = useSyncExternalStore(pointer.subscribe, pointer.getSnapShot);	// *** sdata = subscribed data by fullName
	
	return sdata;
}





// PUBLIC SIMPLE API

export const createGloper = function(name, option = {}) {

	if (typeof option !== 'object')
		throw new Error('createGloper(x, option?): option must be an object form {state: x, persist: true/false}');

	if (soGloper.validName(name) !== true)
		throw new Error('invalid name: ' + soGloper.validName(name));


	const [groupName, stateName] = soGloper.splitName(name);
	const fullName = soGloper.fullName(groupName, stateName);
	
	let state = option.state;
	
	try {

		setupHook(stateName, state, groupName, option);		
		return (groupName + '_' + stateName);
	}
	
	catch (error) {
	
		throw new Error('createGloper: ' + error);
		return undefined;
	}
}

export const useGloper = function(name, option = {}) {

	if (soGloper.validName(name) !== true)
		throw new Error('invalid name: ' + soGloper.validName(name));
		
		
	try {
	
		const [groupName, stateName] = soGloper.splitName(name);
		const fullName = soGloper.fullName(groupName, stateName);

		if (!(fullName in store))
			throw 'Invalid name (must be in the form group_name or name)'
		

		if (store[fullName].init === false)	// *** load if the base state is uninitialized (does not matter promise or value here, unlike get and set)
			initHook(fullName);

		return useHook(stateName, option.state, groupName, option);
	}

	catch (error) {
	
		throw new Error('useGloper: ' + error);
		return undefined;
	}	
}

export const createGlobal = createGloper;
soGloper.createGlobal = createGloper;
soGloper.createGloper = createGloper;

export const useGlobal = useGloper;





// PROGRAMATIC APIs

soGloper.validName = function(name) {

	if (name.includes(' '))	// dotted name has space
		return 'name has space';
		

	if (name.includes('_'))
		name = name.replaceAll('_', '.');	// convert _ to .
		
		

	// check valid name splits
	
	const splitNames = name.split('.');
	let split;
	
	for (let index = 0; index < splitNames.length; index++) {
	
		split = splitNames[index];
		
		if (split.length === 0)	// blank split name
			return 'blank name or name begins with an underscore _ or have consecutive underscores __';

	}

	return true;
}



soGloper.splitName = function(name) {

	if (typeof name !== 'string' || name.length === 0)
		throw new Error('Invalid name in soGloper.splitName(name): must be in the form "group_name" or just "name" for ungrouped');


	if (name.includes('_'))
		name = name.replaceAll('_', '.');	// *** convert inquiry from _ to .


	if (name.includes('.')) {	// group name specified

		var splitPosition = name.lastIndexOf('.');
		var groupName = name.slice(0, splitPosition);
		var stateName = name.slice(splitPosition + 1);

		if (groupName.length === 0)
			throw new Error('Invalid group name');
		
		if (stateName.length === 0)
			throw new Error('Invalid state name');
			
	}
	
	else {	// group unspecified (use "ungrouped" as the group name)
	
		var groupName = 'ungrouped';
		var stateName = name;		
	}

	return [groupName, stateName];
}



// *** generate the actual key name in persist storage

soGloper.fullName = function(groupName, stateName) {

	if (typeof groupName !== 'string')
		throw new Error('gloper.fullName(groupName): groupName as a first parameter must be a string');
		
	if (typeof stateName !== 'string')
		throw new Error('gloper.fullName(x, stateName): stateName as a second parameter must be a string');


	if (groupName.includes('_'))
		groupName = groupName.replaceAll('_', '.');	// *** convert inquiry from _ to .

	
	return prefix + persistAppName + nameDivider + groupName + nameDivider + stateName;
}



soGloper.group = function(groupName) {	// *** soGloper group by groupName

	if (groupName === undefined || typeof groupName !== 'string')
		throw new Error('soGloper.group(groupName) must be a string');


	var soHook = {

		createGloper: function(stateName, option = {}) { 
		
			try { return createGloper(groupName + '.' + stateName, option); }
			catch (error) { throw new Error('soGloper.group.createGloper(stateName, option) failed.  Double check stateName is correct.' + error); }
		},
		
		createGlobal: function(stateName, option = {}) { 
		
			try { return createGloper(groupName + '.' + stateName, option); }
			catch (error) { throw new Error('soGloper.group.createGlobal(stateName, option) failed.  Double check stateName is correct. ' + error); }
		},

		useGloper: function(stateName) {

			try { var hook = useGloper(groupName + '.' + stateName); return hook; }
			catch (error) { throw new Error('soGloper.group.useGloper(stateName) failed.  Double check stateName is correct. ' + error); }
		},
		
		useGlobal: function(stateName) {

			try { var hook = useGloper(groupName + '.' + stateName); return hook; }
			catch (error) { throw new Error('soGloper.group.useGlobal(stateName) failed.  Double check stateName is correct. ' + error); }
		},
		
		get: function(stateName) {

			try { return soGloper.get(groupName + '.' + stateName); }
			catch (error) { throw new Error('soGloper.group.get(stateName) failed.  Double check stateName is correct. ' + error); }
		},

		set: function(stateName, value) {

			try { return soGloper.set(groupName + '.' + stateName, value); }
			catch (error) { throw new Error('soGloper.group.set(stateName) failed.  Double check stateName is correct. ' + error); }
		},
		
		list: function(option = {}) {

			try { return soGloper.list(groupName, option); }
			catch (error) { throw new Error('soGloper.group.list() failed. ' + error); }
		},
		
		reset: function(stateName, option) {

			try { return soGloper.reset(groupName + '.' + stateName, option); }
			catch (error) { throw new Error('soGloper.group.reset("' + stateName + '") failed.  Double check stateName is correct. ' + error); }
		},
		
		resetAll: function(option) {

			try { return soGloper.resetAll(option); }
			catch (error) { throw new Error('soGloper.group.resetAll() failed. ' + error); }
		}
	}
	
	return soHook;
}



soGloper.get = function(name) {

	let dottedName = name;
		
	if (dottedName.includes('_'))
		dottedName = dottedName.replaceAll('_', '.');	// *** convert inquiry from _ to .



	try {

		// get the full name of the requested gloper
		
		const [groupName, stateName] = soGloper.splitName(dottedName);
		const gloperFullName = soGloper.fullName(groupName, stateName);

		if (!(gloperFullName in store))
			throw 'Invalid name: ' + soGloper.validName(dottedName);



		// return data based on the gloper initialization

		const gloper = store[gloperFullName];
		
		if (gloper.init === false) {	// gloper(root) is not initialized

			if (gloper.persist && useIndexedDB === false && localStorage.hasOwnProperty(gloperFullName)) {	// has record in localStorage (sync init)

				initHook(gloperFullName);
			}
			
			else if (gloper._state_ === undefined || gloper._state_ === null) {	// these have no constructor
			
				initHook(gloperFullName);
			}
			
			else if (gloper._state_.constructor.name === 'AsyncFunction' || (gloper.persist && useIndexedDB)) { // asynchronous initialization

				return initHook(gloperFullName).then(
				
					() => _get(dottedName, gloperFullName)	// *** then continue the get inside here
				);
			}
			
			else {	// synchronous initialization

				initHook(gloperFullName);	// *** then continue the get from below
			}
		}


		
		// return the get chain data
		
		return _get(dottedName, gloperFullName);
	}
	
	catch (error) {
	
		throw new Error('gloper.get("' + dottedName + '"): ' + error);
	}
}

const _get = function(dottedName, fullName) {

	return store[fullName].currentData;
}



soGloper.set = function(name, value, option = {}) {

	let dottedName = name;

	if (dottedName.includes('_'))
		dottedName = dottedName.replaceAll('_', '.');	// *** convert inquiry from _ to .
		

		
	try {

		// get the full name of the requested gloper
		
		const [groupName, stateName] = soGloper.splitName(dottedName);
		const gloperFullName = soGloper.fullName(groupName, stateName);

		if (!(gloperFullName in store))
			throw 'Invalid name: ' + soGloper.validName(dottedName);



		// return data based on the gloper(root) initialization
		
		const gloper = store[gloperFullName];

		if (gloper.init === false) {	// gloper(root) is not initialized

			if (gloper.persist && useIndexedDB === false && localStorage.hasOwnProperty(gloperFullName)) {	// has record in localStorage (sync init)

				initHook(gloperFullName);
			}
			
			else if (gloper._state_ === undefined || gloper._state_ === null) {	// these have no constructor
			
				initHook(gloperFullName);
			}
						
			else if (gloper._state_.constructor.name === 'AsyncFunction' || (gloper.persist && useIndexedDB)) { // asynchronous initialization
		
				initHook(gloperFullName).then(
				
					() => _set(dottedName, gloperFullName, value, option)		// *** then continue the set inside here
				);
			}
			
			else {	// synchronous initialization
		
				initHook(gloperFullName);	// *** then continue the set from below
			}
		}

					

		// start the set chain
		
		_set(dottedName, gloperFullName, value, option);
	}
	
	catch(error) {
	
		throw new Error('gloper.set("' + dottedName + '"): ' + error);
	}
}

const _set = function(dottedName, fullName, value, option) {

	store[fullName].setData(value);
}



soGloper.list = function(groupName, option = {}) {

	if (groupName === undefined) {	// all groups
	
		var targetName = prefix + persistAppName + nameDivider;
	}
	
	else {	// specific group
	
		if (typeof groupName === 'string') {

			if (groupName.includes('_'))
				groupName = groupName.replaceAll('_', '.');	// *** convert inquiry from _ to .
				
		
			if (option.excludeSubgroups)
				var targetName = this.fullName(groupName, '');
			else
				var targetName = prefix + persistAppName + nameDivider + groupName;
				
		}
		
		else {
		
			throw new Error('soGloper.list(groupName) must be a string');
		}
	}



	// generate list by group or all groups
	
	let list = [];
	let stateName;	// *** this can include subgroup name within a group
	var proposedFullName;
	
	for (let fullName in store) {

		if (fullName.includes(targetName)) {

			stateName = fullName.replaceAll(targetName, '').replaceAll(nameDivider, '_').replaceAll('.', '_');	// *** convert display from . to _

			if ((groupName !== '' && groupName !== undefined) && option.excludeSubgroups !== true)
				stateName = stateName.slice(1);



			// *** only list valid proposed full name

			if (groupName === undefined)	// include all groups
				proposedFullName = '_@*.*@_';
			else
				proposedFullName = soGloper.fullName(...soGloper.splitName(groupName + '_' + stateName));

				
			if (proposedFullName in store || proposedFullName === '_@*.*@_') {
			
				if (stateName.slice(0, 10) === 'ungrouped_')
					list.push(stateName.slice(10));
				else
					list.push(stateName);

			}
		}	
	}
	
	return list;
}



soGloper.reset = function(name, option) {

	try {
	
		if (typeof option === 'object' && 'withValue' in option)
			var customValue = option.withValue;
		else
			var customValue = undefined;


		const [groupName, stateName] = this.splitName(name);
		const fullName = this.fullName(groupName, stateName);

		if (customValue === undefined)
			processInitialState(store[fullName]._state_, store[fullName]);
		else
			store[fullName].setData(customValue);

	}
	
	catch (error) {
	
		throw new Error('gloper.reset("' + name + '") failed.  Double check dottedName is correct.');
	}		
}

soGloper.resetAll = function(option) {

	try {
	
		if (typeof option === 'object' && 'withValue' in option)
			var customValue = option.withValue;
		else
			var customValue = undefined;
			

		// for global store in memory (*** setEffect on "data" will update any persists based on any setData() calls)
		
		var searchPrefix = prefix + persistAppName + nameDivider;

		for (let name in store) {
		
			if (name.includes(searchPrefix)) {

				if (customValue === undefined)
					processInitialState(store[name]._state_, store[name]);
				else		
					store[name].setData(customValue);

			}
		}
	}
	
	catch (error) {
	
		throw new Error('gloper.resetAll() failed.');
	}
}





// PERSIST DATABASE HANDLINGS

soGloper.localStorage = {

	list: function() {

		var new_list = [];
		var searchPrefix = prefix + persistAppName + nameDivider;
		
		for (let fullName of Object.keys(localStorage)) {
		
			if (fullName.includes(searchPrefix))
				new_list.push(fullName.replace(searchPrefix, '').replace(nameDivider, '.'));
				
		}
		
		return new_list.sort();	
	},
	
	removeAll: function() {

		var searchPrefix = prefix + persistAppName + nameDivider;
		
		for (let fullName of Object.keys(localStorage)) {
		
			if (fullName.includes(searchPrefix))
				localStorage.removeItem(fullName);
				
		}				
	}
};

soGloper.indexedDB = {

	list: function() {

		return soStorage.list().then(function(list) {

			var new_list = [];
			var searchPrefix = prefix + persistAppName + nameDivider;
		
			for (let entry of list) {
	
				if (entry.name.includes(searchPrefix))	// *** entry.name = fullName
					new_list.push(entry.name.replace(searchPrefix, '').replace(nameDivider, '.'));
		
			}

			return new_list.sort();
		});
	},
	
	removeAll: function() {
		
		var list = soStorage.list();
		var searchPrefix = prefix + persistAppName + nameDivider;
		
		list.then(function(list) {

			for (let entry of list) {

				if (entry.name.includes(searchPrefix))	// entry.name = fullName
					soStorage.remove(entry.name);
			}	
		});
	}
}





export {soGloper as SoGloper};





//----------------------------------------------------------------------------------------
// MAIN: soStorage (*** this is a custom copy of the soStorage.js; bundled for convenient)





// PRIVATE API: soStorage

// key to value concept similar to Local Storage (native indexedDB; inherited the advantages for advance data types as value, persistency and large storage)

const soStorage = {

	// user interfaces
	
	get: function(name, action) {	// get a specific key by the name

		return this.command('get', name, undefined, action);
	},

	list : function(action) {	// list of all keys with their respective values

		return this.command('list', undefined, undefined, action);
	},
	
	match: function(option, action) {	// match a range of keys and list their respective values (using indexedDB option syntax)

		return this.command('match', option, undefined, action);
	},	

	set: function(name, value, action) {	// set a key with value

		return this.command('set', name, value, action);
	},
	
	remove: function(name, action) {	// remove a key

		return this.command('remove', name, undefined, action);
	},
	
	clear: function(action) {	// clear all keys

		return this.command('clear', undefined, undefined, action);
	}	
};





// automatically runs and creates a "soStorage" database in indexedDB with a store called "entry" (when it does not already exist)

soStorage.open = function() {

	var connection = indexedDB.open('soStorage');
	var db;

	connection.onupgradeneeded = function(event) {

		db = event.target.result;
		db.createObjectStore('entry', {keyPath: "name"});
		db.close();
	};
}();





// main access to database based on a command and its related parameters (this supports callback, promise...then and async...await)
	
soStorage.command = function(command, parameter1, parameter2, parameter3) {

	var result_ready = new Promise(function(resolve, reject) {	

		var connection = indexedDB.open('soStorage');

		connection.onsuccess = function(event) {	
		
			var db = event.target.result;


			// set the corresponding indexedDB query based on the specified command
			
			if (command === 'get')
				var query = db.transaction('entry', 'readonly').objectStore('entry').get(parameter1);

			else if (command === 'list')
				var query = db.transaction('entry', 'readonly').objectStore('entry').getAll();

			else if (command === 'match')
				var query = db.transaction('entry', 'readonly').objectStore('entry').getAll(parameter1);

			else if (command === 'set')
				var query = db.transaction('entry', 'readwrite').objectStore('entry').put({name: parameter1, value: parameter2});

			else if (command === 'remove')			
				var query = db.transaction('entry', 'readwrite').objectStore('entry').delete(parameter1);

			else if (command === 'clear')			
				var query = db.transaction('entry', 'readwrite').objectStore('entry').clear();
				

						
			query.onsuccess = function(event) {
				
				var result = event.target.result;


				// attempt to return and access result
				
				try {

					if (command === 'get')
						resolve(result.value);
					else
						resolve(result);
				}
				
				catch(error) {	// this is for command 'get'

					resolve(undefined);
					console.log('soStorage: (' + command + ': ' + parameter1 + ') has no results');
				}							



				// attempt to run the specified callback function
				
				try {
				
					if (parameter3 !== undefined && result !== undefined) {
					
						if (command === 'get')
							parameter3(result.value);
						else
							parameter3(result);
							
					}
				}
				
				catch(error) {
				
					console.log('soStorage: (' + command + ') callback invalid/fails');
				}
				
				
				db.close();
			}
		}

		connection.onerror = function(event) {
		
			console.log('(' + command, ') fails', event);
		}
	});
	
	return result_ready;
}