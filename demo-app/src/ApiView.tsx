/*
	Copyright (c) 2025 Chung Lim Lee and Savvy Open
	All rights reserved.
*/





import {useNavigate} from 'react-router-dom';

function ApiView() {

	console.log('APIs View re-rendered');

	const navigate = useNavigate();
	
	return (
	<>

		This page serves as a placeholder to refresh the app and bypass preloading of reactive states from other pages.
		<br/><br/>
		
		Open developer console (Ctrl+Shift+I):
		<br/>
		Type: SoGloper.get('test')
		<br/><br/>
		First call will return a promise due to <em>lazy loading</em> using async function for initial state.
		<br/>
		Subsequent calls will return the <em>cached state</em>.
		<br/><br/>
		* Try createGloper() for <em>dynamic state creations</em>, list(), set(), reset(), group() and more.
		<br/><br/>
		
		<button onClick={() => navigate('/Report')}>Back</button>
	</>
	
	);
}

export default ApiView;