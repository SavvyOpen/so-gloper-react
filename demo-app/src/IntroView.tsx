/*
	Copyright (c) 2025 Chung Lim Lee and Savvy Open
	All rights reserved.
*/





import {useNavigate} from 'react-router-dom';



function IntroView() {

	const navigate = useNavigate();

	console.log('Intro View re-rendered');
	
	return (
	<>
		<div className='custom-div'>
		<em>Persistent state across browser refresh</em>
		<br/>
		Built-in support for LocalStorage/IndexedDB
		<br/><br/>
		</div>
		
		<div className='custom-div'>
		<em>Namespace grouping using snake_case</em>
		<br/>
		<code>createGloper(name, {"{"}state: x, persist: true{"}"})</code>
		<br/><br/>
		</div>
		
		<div className='custom-div'>		
		Access from any components using
		<br/>
		<code>useGloper(name)</code>
		<br/><br/>
		</div>

		<div className='custom-div'>		
		Reset all states to initial values
		<br/>
		(sync with persistent values if present)
		<br/>
		<code>SoGloper.resetAll()</code>
		<br/><br/>
		</div>
		<br/>

		<button onClick={() => navigate('/Data')}>Next</button>
	</>
	);
}

export default IntroView;