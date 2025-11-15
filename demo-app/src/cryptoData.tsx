/*
	Copyright (c) 2025 Chung Lim Lee and Savvy Open
	All rights reserved.
*/





export async function getCryptoData() {

	try {
	
		const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana,dogecoin,cardano,chainlink&vs_currencies=usd')
		const data = await response.json();

		const result = JSON.stringify(data);
		return result;

	} catch(error) {

		console.error('Error fetching crypto prices:', error);
		return null;
	}
}

interface CryptoData {

	[key: string]: {

		usd: number;
	};
}

export function formatCryptoData(data: string) {

	if (!data)
		return null;
		

	try {

		const parsedData = JSON.parse(data) as CryptoData;

		const elements = Object.entries(parsedData).map(([key, value]) => (

			  <span key={key}>
				{key}: {value.usd.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
				<br />
			  </span>
		));

		return <>{elements}</>;	// wrap in a single element

	} catch (error) {

		console.error('', error);
		return null;
	}
}
