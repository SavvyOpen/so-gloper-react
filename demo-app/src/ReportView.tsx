/*
	Copyright (c) 2025 Chung Lim Lee and Savvy Open
	All rights reserved.
*/





import {useNavigate} from 'react-router-dom';
import {useGloper, SoGloper} from './soGloper.js'

import {formatCryptoData} from './cryptoData.tsx';



function ReportView() {

	const [data] = useGloper('crypto_data');
	const [comment] = useGloper('crypto_comment');



	const navigate = useNavigate();

	console.log('Report View re-rendered');

	return (
	<>
		<div>
		<em>Data is shared across components</em>
		</div>
		<br/>
		
		<div className='custom-div'>
			REPORT
			<br/><br/>
			{formatCryptoData(data)}
			<hr/>
			{comment}
		</div>
		<br/>
		
		<button onClick={() => navigate('/Data')}>Prev</button>
		<button onClick={() => SoGloper.resetAll()}>Reset</button>
		<button onClick={() => navigate('/APIs')}>Next</button>
	</>
	);
}

export default ReportView;