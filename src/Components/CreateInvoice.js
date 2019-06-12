// https://coolors.co/8c99ff-c6afff-b596ff-192466-fff4fa

//TODO: FIX duplicate on realtime db
//TODO: Check for name in test.pdf
import React, { useState } from 'react';
import jsPDF from 'jspdf';
import firebase from 'firebase/app';
import 'firebase/storage';
import 'firebase/auth';
import 'firebase/database';
import creativedaylogo from '../Assets/creativedaylogo.png';
import invoice from '../Assets/invoice.png';
import footer from '../Assets/footer.png';
const Dashboard = () => {
	const database = firebase.database();
	const [ clientInfo, setClientInfo ] = useState({
		name: '',
		address: '',
		city: ''
	});

	const predefined = {
		name: 'Michael Langhals',
		address: '9240 Old Redwood Hwy Ste 114',
		city: 'Windsor, CA 95492',
		total: "0",
		filename: "test",
	}

	const [ items, setItems ] = useState([
		{
			id: 1,
			description: 'This is a Test Description',
			price: 0.99
		},
		{
			id: 2,
			description: 'This is a Test Description',
			price: 20.0
		},
		{
			id: 3,
			description: 'This is a Test Description',
			price: 40.0
		}
	]);

	const [ nameOfPDF, setNameOfPDF ] = useState('');
	const [ readyToUpload, setReadyToUpload ] = useState(false);
	const [ uploadedPercentage, setUploadedPercentage ] = useState(0);
	const [ uploadCompleted, setUploadCompleted ] = useState(false);

	const updateItemDescription = (item, value) => {
		let n = items.map((it) => {
			if (it.id === item.id) it.description = value;
			return it;
		});
		setItems(n);
	};

	const updateItemPrice = (item, value) => {
		let n = items.map((it) => {
			if (it.id === item.id) it.price = +value;
			return it;
		});
		setItems(n);
	};
	const calculateTotal = () => {
		return items.reduce((acc, val) => {
			return acc + val.price;
		}, 0);
	};

	const uploadPDFToDatabase = (metadata) => {
		let user = firebase.auth().currentUser;
		database.ref(`/files/${user.uid}/invoices/`).push({
			metadata: metadata
		});
	};

	const uploadPDFToStorage = (file) => {
		let user = firebase.auth().currentUser;
		let storageRef = firebase.storage().ref(`/${user.uid}/invoices/${nameOfPDF || predefined.filename}`);
		console.log(firebase.auth().currentUser);

		let metadata = {
			cacheControl: 'public,max-age=300',
			contentLanguage: 'en',
			contentType: 'application/pdf',
			customMetadata: {
				timestamp: Date.now()
			}
		};
		let task = storageRef.put(file, metadata);
		task.on(
			'state_changed',
			function progress(snapshot) {
				let percentage = snapshot.bytesTransferred / snapshot.totalBytes * 100;
				console.log(percentage);
				setUploadedPercentage(percentage);
			},
			function error(err) {
				console.error(err);
			},
			function completed() {
				document.getElementById('progress-bar-colored').style.backgroundColor = '#192466';
				setUploadCompleted(true);
				// Get metadata properties
				storageRef
					.getMetadata()
					.then(function(metadata) {
						uploadPDFToDatabase(metadata);
					})
					.catch(function(error) {
						console.error(error);
						// Uh-oh, an error occurred!
					});
			}
		);
	};

	const uploadPDF = (file) => {
		setReadyToUpload(true);
		uploadPDFToStorage(file);
	};

	const addItemtoList = () => {
		setItems([
			...items,
			{
				id: items.length + 1,
				description: '',
				price: 0
			}
		]);
	};

	const createPDF = (arrayOfItems) => {
		let doc = new jsPDF({
			orientation: 'p',
			unit: 'px',
			foqrmat: 'a4'
		});

		let secondaryColor = "#39B0E5";
		doc.addImage(
			document.getElementById('img'),
			'PNG',
			doc.internal.pageSize.getWidth() / 2 - 50,
			20,
			100,
			20,
			'wf',
			'FAST'
		);

		doc.addImage(
			document.getElementById('img-invoice'),
			'PNG',
			0,
			80,
			doc.internal.pageSize.getWidth(),
			100,
			'dwa',
			'FAST'
		);

		doc.setFont('helvetica');
		doc.setTextColor('#ffffff');
		doc.setFontType('bold');
		doc.setFontSize(25);
		doc.text(doc.internal.pageSize.getWidth() / 2 - calculateWidth(25, 'BILL TO:', doc) / 2, 115, 'BILL TO:', {
			align: 'center'
		});
		doc.setFontSize(13);

		let billingName = clientInfo.name || predefined.name;
		let billingAddress = clientInfo.address || predefined.address;
		let billingCity = clientInfo.city || predefined.city;
		doc.text(
			doc.internal.pageSize.getWidth() / 2 - calculateWidth(13, billingName, doc) / 2,
			148,
			billingName,
			{
				align: 'center'
			}
		);

		doc.setFontSize(11);
		doc.setFontType('normal');
		doc.text(
			doc.internal.pageSize.getWidth() / 2 - calculateWidth(11, billingAddress, doc) / 2,
			160,
			billingAddress,
			{
				align: 'center'
			}
		);
		doc.text(
			doc.internal.pageSize.getWidth() / 2 - calculateWidth(11, billingCity, doc) / 2,
			170,
			billingCity,
			{
				align: 'center'
			}
		);

		doc.setTextColor(secondaryColor);
		doc.text(
			60 + 0 * doc.internal.pageSize.getWidth() / 4 - calculateWidth(11, 'INVOICE #', doc),
			210,
			'INVOICE #',
			{
				align: 'center'
			}
		);

		doc.setTextColor(secondaryColor);
		doc.text(
			60 + 1 * doc.internal.pageSize.getWidth() / 4 - calculateWidth(11, 'INVOICE DATE', doc),
			210,
			'INVOICE DATE',
			{
				align: 'center'
			}
		);
		doc.setTextColor(secondaryColor);
		doc.text(60 + 2 * doc.internal.pageSize.getWidth() / 4 - calculateWidth(11, 'DUE DATE', doc), 210, 'DUE DATE', {
			align: 'center'
		});

		doc.text(60 + 3 * doc.internal.pageSize.getWidth() / 4 - calculateWidth(11, 'REF #', doc), 210, 'REF #', {
			align: 'center'
		});

		doc.setTextColor('#000');
		doc.setFontSize(10);

		doc.text(60 + 0 * doc.internal.pageSize.getWidth() / 4 - calculateWidth(11, '0003653', doc), 220, '0003653', {
			align: 'center'
		});

		doc.text(
			60 + 1 * doc.internal.pageSize.getWidth() / 4 - calculateWidth(11, '06 June 2019', doc),
			220,
			'06 June 2019',
			{
				align: 'center'
			}
		);

		doc.text(
			60 + 2 * doc.internal.pageSize.getWidth() / 4 - calculateWidth(11, '06 June 2019', doc),
			220,
			'06 June 2019',
			{
				align: 'center'
			}
		);
		doc.text(60 + 3 * doc.internal.pageSize.getWidth() / 4 - calculateWidth(11, '007733', doc), 220, '007733', {
			align: 'center'
		});

		doc.setLineWidth(2.5);
		doc.setDrawColor(237, 237, 237);
		doc.line(0, 240, doc.internal.pageSize.getWidth(), 240, 'F');

		doc.setFontSize(11);
		doc.setFontType('normal');
		doc.setTextColor(secondaryColor);
		doc.text(60, 280, '#', {
			align: 'left'
		});
		doc.text(70, 280, 'Item Descritpion', {
			align: 'left'
		});
		doc.text(doc.internal.pageSize.getWidth() - 60, 280, 'Amount', {
			align: 'right'
		});

		doc.setLineWidth(0.5);
		doc.setDrawColor(221, 220, 220);
		doc.line(50, 290, doc.internal.pageSize.getWidth() - 50, 290, 'F');

		///

		let currentHeight = 305;
		arrayOfItems.forEach((item) => {
			console.log(item.description)
			doc.setTextColor('#000');
			doc.text(60, currentHeight, ""+item.id, {
				align: 'left'
			});
			doc.text(70, currentHeight, item.description, {
				align: 'left'
			});
			doc.text(doc.internal.pageSize.getWidth() - 60, currentHeight, item.price.toFixed(2), {
				align: 'right'
			});
			doc.setLineWidth(0.5);
			doc.setDrawColor(221, 220, 220);
			doc.line(50, currentHeight+10, doc.internal.pageSize.getWidth() - 50, currentHeight+10, 'F');
			currentHeight+= 26;
		});

		doc.addImage(
			document.getElementById('img-footer'),
			'PNG',
			0,
			doc.internal.pageSize.getHeight() - 30,
			doc.internal.pageSize.getHeight(),
			doc.internal.pageSize.getHeight(),
			'wadf'
		);

		doc.setTextColor('#fff');
		doc.setFontSize(11);
		doc.text(
			doc.internal.pageSize.getWidth() / 2 - calculateWidth(11, 'www.creativeday.me', doc) / 2,
			doc.internal.pageSize.getHeight() - 15,
			'www.creativeday.me',
			{
				align: 'center',
				charSpace: 2
			}
		);
		// console.log(doc.output('datauristring', 'filename.pdf'));
		// let file = doc.save('one.pdf');
		let file = doc.output('blob');
		// console.log(file);
		uploadPDF(file);
	};

	const showItems = () => {
		console.log(items);
	};

	const calculateWidth = (fontSize, string, doc) => {
		console.log(string, 'width', string.length * (fontSize / 1.618));
		return 50 * (fontSize / 1.618) / doc.internal.pageSize.getWidth();
	};

	return (
		<form name="invoice-form" className="invoice-form">
			<div style={{ display: 'none' }}>
				<img id="img" width="100" height="100" src={creativedaylogo} alt="invisible" />
				<img id="img-invoice" width="100" height="100" src={invoice} alt="invisible" />
				<img id="img-footer" width="100" height="100" src={footer} alt="invisible" />
			</div>
			<div className="client-info-inputs">
				<h1>Client Info</h1>
				<div className="inputs">
					<input
						onChange={(e) => setClientInfo({ ...clientInfo, name: e.target.value })}
						value={clientInfo.name}
						placeholder="Name"
					/>
					<input
						onChange={(e) => setClientInfo({ ...clientInfo, address: e.target.value })}
						value={clientInfo.address}
						placeholder="Address"
					/>
					<input
						onChange={(e) => setClientInfo({ ...clientInfo, city: e.target.value })}
						value={clientInfo.city}
						placeholder="City"
					/>
				</div>
			</div>
			<div className="button-area">
				<div onClick={() => addItemtoList()} className="button">
					+ add Item
				</div>

				<div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
					{uploadCompleted && <div>Completed</div>}
					{readyToUpload && (
						<div className="progress-bar">
							<div style={{ width: uploadedPercentage }} id="progress-bar-colored" />
						</div>
					)}
					<div onClick={() => createPDF(items)} className="button">
						Create PDF
					</div>
				</div>
			</div>
			<div className="input-with-label">
				<input id="name-of-pdf" placeholder="test" onChange={(e) => setNameOfPDF(e.target.value)} value={nameOfPDF} />
				<div className="file-extention">
					.pdf
				</div>
			</div>

			<div className="item-description-table">
				<div className="entry-title">
					<div>#</div>
					<div>Item Description</div>
					<div>Price</div>
				</div>
				{items.map((item) => {
					return (
						<div key={item.id} className="entry">
							<div>{item.id}</div>
							<div>
								<input
									type="text"
									placeholder="item name"
									value={item.description}
									onChange={(e) => updateItemDescription(item, e.target.value)}
								/>
							</div>
							<div>
								<input
									type="number"
									value={item.price}
									placeholder="item name"
									onChange={(e) => updateItemPrice(item, e.target.value)}
									pattern="[0-9]*"
								/>
							</div>
						</div>
					);
				})}
			</div>
			<div className="client-total-bill">
				<div>Total Balance {calculateTotal().toFixed(2)}$</div>
			</div>
		</form>
	);
};
export default Dashboard;