/*
	Copyright (c) 2025 Chung Lim Lee and Savvy Open
	All rights reserved.
*/





import {Routes, Route, Link} from 'react-router-dom';
import './App.css';

import IntroView from './IntroView.tsx';
import DataView from './DataView.tsx';
import ReportView from './ReportView.tsx';
import ApiView from './ApiView.tsx';



function App() {
	
	return (
	<>
		<div className='demo-message'>
			SoGloper Library - Simple Mode (Demo)
		</div>

		<nav>
			<Link to="/">Intro</Link> | <Link to="/Data">Get Data</Link> | <Link to="/Report">Get Report</Link> | <Link to="/APIs">APIs</Link>
		</nav>
		<br/>
		
		<Routes>
			<Route path="/" element={<IntroView />} />			
			<Route path="/Data" element={<DataView />} />
			<Route path="/Report" element={<ReportView />} />
			<Route path="/APIs" element={<ApiView />} />
		</Routes>	
	</>
	);
}

export default App
