/*
	Copyright (c) 2025 Chung Lim Lee and Savvy Open
	All rights reserved.
*/





import {useNavigate} from 'react-router-dom';
import {useGloper} from './soGloper.js';
import {getCryptoData} from './cryptoData.tsx';



function DataView() {

	const [data, setData] = useGloper('crypto_data');
	const [comment, setComment] = useGloper('crypto_comment');
	
	const navigate = useNavigate();



	console.log('Data View re-rendered');
	
	return (
	<>
		Live Crypto Data:
		<button onClick={async () => setData(await getCryptoData())}>Get</button>
		<br/><br/>
		
		<em>Persistent state across browser refresh</em>
		<br/><br/>
		
		<textarea value={data} onChange={e => setData(e.target.value)} readOnly placeholder='Click "Get" for live crypto data.' />
		<textarea value={comment} onChange={e => setComment(e.target.value)} placeholder='Add a comment about the data, then click "Next" or navigate to "Get Report".' />
		<br/>
		
		<button onClick={() => navigate('/')}>Prev</button><button onClick={() => navigate('/Report')}>Next</button>
	</>
	);
}

export default DataView;