/*
	Copyright (c) 2025 Chung Lim Lee and Savvy Open
	All rights reserved.
*/





import {StrictMode} from 'react'
import {createRoot} from 'react-dom/client'
import './index.css'
import App from './App.tsx'

import {HashRouter} from 'react-router-dom';

import {createGloper, SoGloper} from './soGloper.js';



// *** optional configs: only allow to run once and before any createGloper

SoGloper.configure({
	
	persistStorage: 'localStorage',		// default = localStorage, advanced = indexedDB
	autoImmutableUpdate: true,			// default = true (supports Object and Array only)
	consoleDebug: true					// default = false (provides SoGloper.xxx methods at developer console)
});



// create base states

createGloper('crypto_data', {state: '', persist: true});
createGloper('crypto_comment', {state: '', persist: true});

createGloper('test', {state: async () => 'This is a test'});	// for APIs page, test it with SoGloper.get('test'); also for .set(), .list(), .reset(), ...



// main view render

createRoot(document.getElementById('root')!).render(

	<StrictMode>
		<HashRouter>
			<App />
		</HashRouter>
	</StrictMode>
)
