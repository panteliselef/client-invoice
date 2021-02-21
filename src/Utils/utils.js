export const validateEmail = (email) => {
	var re = /^(([^<>()[\]\\.,;:\s@]+(\.[^<>()[\]\\.,;:\s@]+)*)|(.+))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
	return re.test(email);
};

export const bytesToSize = (bytes) => {
	var sizes = [ 'Bytes', 'KB', 'MB', 'GB', 'TB' ];
	if (bytes === 0) return '0 Byte';
	var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
	return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
};

export const getCurrencySymbol = (currency) => {
	switch(currency) {
		case 'USD':
			return '$'
		case 'EURO': 
			return '€'
		default:
			return 'RSD'
	}
}

export const formatForCurrency = (currency, number) => {
	switch(currency) {
		case 'USD':
			return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD',  maximumFractionDigits: 2}).format(number);
		case 'EURO': 
			return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 2 }).format(number);
		default:
			return new Intl.NumberFormat('sr-RS', { style: 'currency', currency: 'RSD', maximumFractionDigits: 2 }).format(number);
	}
}

export const calculateSubTotal = (items) => {
	return items.reduce((acc, val) => acc + val.qty * val.uprice, 0)
};

export const calculateFees = (items,fee) => {
	return (calculateSubTotal(items) * fee / 100)
}

export const calculateTotal = ({items, fees, discount }) => {
	return (calculateSubTotal(items) + calculateFees(items,fees) - discount)
}


// iNumber is the invoice number
export const formatInvoiceNumber = (iNumber) => {
	return '0'.repeat(3 - (iNumber + 1).toString().length).concat((iNumber + 1).toString());
}