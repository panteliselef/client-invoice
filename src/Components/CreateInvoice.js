// https://coolors.co/8c99ff-c6afff-b596ff-192466-fff4fa

import Header from './Header';
import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import firebase from 'firebase/app';
import 'firebase/storage';
import 'firebase/auth';
import 'firebase/database';
import { NavLink } from 'react-router-dom';
import creativedaylogo from '../Assets/creativedaylogo.png';
import invoice from '../Assets/invoice.png';
import footer from '../Assets/footer.png';
import QRcode from '../Assets/QRcode.png';
import arrowBox from '../Assets/arrow-left-box.svg';
const Dashboard = (props) => {
	const database = firebase.database();

	const [ maxNoteCharacters, setMaxCharacters ] = useState(650);
	const [ lrefNumber, setlRefNumber ] = useState('');
	const [ linvoiceNumber, setlInvoiceNumber ] = useState('');
	const firebaseFiles = database.ref(`/files/${props.uid}/invoices`);
	const [ clientInfo, setClientInfo ] = useState({
		name: '',
		address: '',
		city: ''
	});

	useEffect(() => {
		firebase.database().ref('/appInfo/lrefNumber').once('value', (snapshot) => {
			setlRefNumber(snapshot.val());
		});

		firebase.database().ref('/appInfo/linvoiceNumber').once('value', (snapshot) => {
			setlInvoiceNumber(snapshot.val());
		});
	}, []);

	const predefined = {
		name: 'Michael Langhals',
		address: '9240 Old Redwood Hwy Ste 114',
		city: 'Windsor, CA 95492',
		total: '0',
		filename: 'test'
	};

	const [ items, setItems ] = useState([
		{
			id:1,
			description: "",
			price:0
		}
		// {
		// 	id: 1,
		// 	description: 'This is a Test Description',
		// 	price: 0.99
		// },
		// {
		// 	id: 2,
		// 	description: 'This is a Test Description',
		// 	price: 20.0
		// },
		// {
		// 	id: 3,
		// 	description: 'This is a Test Description',
		// 	price: 40.0
		// }
	]);

	const [ nameOfPDF, setNameOfPDF ] = useState('');
	const [ notes, setNotes ] = useState('');
	const [ readyToUpload, setReadyToUpload ] = useState(false);
	const [ uploadedPercentage, setUploadedPercentage ] = useState(0);
	const [ uploadCompleted, setUploadCompleted ] = useState(false);

	const checkForDuplicatePdf = () => {
		return new Promise((resolve, reject) => {
			firebaseFiles.once('value', (snapshot) => {
				snapshot.forEach((child) => {
					console.log(child.val().metadata.name, `${nameOfPDF}.pdf`);
					if (`${nameOfPDF || predefined.filename}.pdf` === child.val().metadata.name)
						reject({ error: new Error('Found duplicate file'), id: child.key });
				});
				resolve('Hey');
			});
		});
	};

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
		let storageRef = firebase.storage().ref(`/${user.uid}/invoices/${nameOfPDF || predefined.filename}.pdf`);
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

		let secondaryColor = '#39B0E5';
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
		const pdfWidth = doc.internal.pageSize.getWidth();

		doc.setFont('helvetica');
		doc.setTextColor('#ffffff');
		doc.setFontType('bold');
		doc.setFontSize(25);
		doc.text(doc.internal.pageSize.getWidth() / 2 - calculateWidth(25, 'BILL TO:', pdfWidth) / 2, 115, 'BILL TO:', {
			align: 'center'
		});
		doc.setFontSize(13);

		// let billingName = clientInfo.name || predefined.name;
		// let billingAddress = clientInfo.address || predefined.address;
		// let billingCity = clientInfo.city || predefined.city;
		let billingName = clientInfo.name || ' ';
		let billingAddress = clientInfo.address || ' ';
		let billingCity = clientInfo.city || ' ';
		doc.text(
			doc.internal.pageSize.getWidth() / 2 - calculateWidth(13, billingName, pdfWidth) / 2,
			148,
			billingName,
			{
				align: 'center'
			}
		);

		doc.setFontSize(11);
		doc.setFontType('normal');
		doc.text(
			doc.internal.pageSize.getWidth() / 2 - calculateWidth(11, billingAddress, pdfWidth) / 2,
			160,
			billingAddress,
			{
				align: 'center'
			}
		);
		doc.text(
			doc.internal.pageSize.getWidth() / 2 - calculateWidth(11, billingCity, pdfWidth) / 2,
			170,
			billingCity,
			{
				align: 'center'
			}
		);

		doc.setTextColor(secondaryColor);
		doc.text(
			60 + 0 * doc.internal.pageSize.getWidth() / 4 - calculateWidth(11, 'INVOICE #', pdfWidth),
			210,
			'INVOICE #',
			{
				align: 'center'
			}
		);

		doc.setTextColor(secondaryColor);
		doc.text(
			60 + 1 * doc.internal.pageSize.getWidth() / 4 - calculateWidth(11, 'INVOICE DATE', pdfWidth),
			210,
			'INVOICE DATE',
			{
				align: 'center'
			}
		);
		doc.setTextColor(secondaryColor);
		doc.text(
			60 + 2 * doc.internal.pageSize.getWidth() / 4 - calculateWidth(11, 'DUE DATE', pdfWidth),
			210,
			'DUE DATE',
			{
				align: 'center'
			}
		);

		doc.text(60 + 3 * doc.internal.pageSize.getWidth() / 4 - calculateWidth(11, 'REF #', pdfWidth), 210, 'REF #', {
			align: 'center'
		});

		doc.setTextColor('#000');
		doc.setFontSize(10);

		console.log('LENGHT', (7 - linvoiceNumber.toString().length) * '0' + linvoiceNumber.toString());
		doc.text(
			60 + 0 * doc.internal.pageSize.getWidth() / 4 - calculateWidth(11, '0003653', pdfWidth),
			220,
			'0'.repeat(7 - (linvoiceNumber + 1).toString().length).concat((linvoiceNumber + 1).toString()),
			{
				align: 'center'
			}
		);

		var today = new Date();
		var tomorrow = new Date();
		tomorrow.setDate(today.getDate() + 1);
		doc.text(
			60 + 1 * doc.internal.pageSize.getWidth() / 4 - calculateWidth(11, '06 June 2019', pdfWidth),
			220,
			today.toDateString(),
			{
				align: 'center'
			}
		);

		doc.text(
			60 + 2 * doc.internal.pageSize.getWidth() / 4 - calculateWidth(11, '06 June 2019', pdfWidth),
			220,
			tomorrow.toDateString(),
			{
				align: 'center'
			}
		);
		doc.text(
			60 + 3 * doc.internal.pageSize.getWidth() / 4 - calculateWidth(11, '007733', pdfWidth),
			220,
			'0'.repeat(6 - (lrefNumber + 1).toString().length).concat((lrefNumber + 1).toString()),
			{
				align: 'center'
			}
		);

		doc.setLineWidth(2.5);
		doc.setDrawColor(237, 237, 237);
		doc.line(0, 240, pdfWidth, 240, 'F');

		doc.setFontSize(11);
		doc.setFontType('normal');
		doc.setTextColor(secondaryColor);
		doc.text(60, 280, '#', {
			align: 'left'
		});
		doc.text(70, 280, 'Item Descritpion', {
			align: 'left'
		});
		doc.text(pdfWidth - 60, 280, 'Amount', {
			align: 'right'
		});

		doc.setLineWidth(0.5);
		doc.setDrawColor(221, 220, 220);
		doc.line(50, 290, pdfWidth - 50, 290, 'F');

		///

		let currentHeight = 305;
		arrayOfItems.forEach((item) => {
			if (item.description !== '' && item.description != null) {
				console.log(item.description);
				doc.setTextColor('#000');
				doc.text(60, currentHeight, '' + item.id, {
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
				doc.line(50, currentHeight + 10, doc.internal.pageSize.getWidth() - 50, currentHeight + 10, 'F');
				currentHeight += 26;
			}
		});

		doc.setFontSize(11);
		doc.setFontType('normal');
		doc.text(
			doc.internal.pageSize.getWidth() - 50,
			currentHeight,
			'Subtotal ' + '$' + calculateTotal().toFixed(2),
			{
				align: 'right'
			}
		);

		doc.setFontType('bold');
		doc.text(
			doc.internal.pageSize.getWidth() - 50,
			currentHeight + 15,
			'Total ' + '$' + calculateTotal().toFixed(2),
			{
				align: 'right'
			}
		);

		currentHeight += 20;

		doc.setLineWidth(1);
		doc.setDrawColor(221, 220, 220);
		doc.line(
			doc.internal.pageSize.getWidth() - 200,
			currentHeight + 13,
			doc.internal.pageSize.getWidth() - 50,
			currentHeight + 13,
			'F'
		);

		doc.addImage(document.getElementById('img-qr-code'), 'PNG', 65, currentHeight - 20, 60, 60, 'da', 'FAST');
		doc.setTextColor(secondaryColor);
		doc.setFontSize(14);
		doc.setFontType('bold');

		doc.text(
			doc.internal.pageSize.getWidth() - 60 - calculateWidth(14, '$' + calculateTotal().toFixed(2)),
			currentHeight + 30,
			'Balance Due',
			{
				align: 'right'
			}
		);

		doc.text(doc.internal.pageSize.getWidth() - 50, currentHeight + 30, `$${calculateTotal().toFixed(2)}`, {
			align: 'right'
		});

		doc.line(
			doc.internal.pageSize.getWidth() - 200,
			currentHeight + 40,
			doc.internal.pageSize.getWidth() - 50,
			currentHeight + 40,
			'F'
		);
		currentHeight += 50;

		//ABOUT NOTES
		if (notes.length > 0) {
			doc.setTextColor('#000');
			doc.setFontSize(11);
			doc.setFontType('bold');
			doc.text(50, currentHeight + 30, 'Notes', {
				align: 'left'
			});
			doc.setFontType('normal');
			doc.setFontSize(10);
			let splitTitle = doc.splitTextToSize(notes, 350);
			doc.text(50, currentHeight + 40, splitTitle);
		}
		//
		doc.addImage(
			document.getElementById('img-footer'),
			'PNG',
			0,
			doc.internal.pageSize.getHeight() - 30,
			doc.internal.pageSize.getHeight(),
			doc.internal.pageSize.getHeight(),
			'wadf',
			'FAST'
		);

		doc.setTextColor('#fff');
		doc.setFontSize(11);
		doc.text(
			doc.internal.pageSize.getWidth() / 2 - calculateWidth(11, 'www.creativeday.me', pdfWidth) / 2,
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
		return file;
	};

	const checkPdf = (arr) => {
		if (notes.length > maxNoteCharacters) {
			window.alert('Your notes have a lot of characters');
		} else {
			checkForDuplicatePdf()
				.then((msg) => {
					console.log('SUCESS', msg);
					let file = createPDF(arr);

					firebase.database().ref('/appInfo/lrefNumber').set(lrefNumber + 1);

					firebase.database().ref('/appInfo/linvoiceNumber').set(linvoiceNumber + 1);

					uploadPDF(file);
				})
				.catch((obj) => {
					console.error(obj.error);
					if (window.confirm('You already have a pdf with this name. Would you like to replace it ?')) {
						let file = createPDF(arr);
						let fileToBeDeleted = database.ref(`/files/${props.uid}/invoices/${obj.id}`);
						fileToBeDeleted.remove().then((val) => {

							firebase.database().ref('/appInfo/lrefNumber').set(lrefNumber + 1);
							firebase.database().ref('/appInfo/linvoiceNumber').set(linvoiceNumber + 1);

							uploadPDF(file);
						});
					} else {
						//no
					}
				});
		}
	};

	const calculateWidth = (fontSize, string, widthOfPdf = 1) => {
		return string.length * (fontSize / 1.618) / widthOfPdf;
	};

	return (
		<div className="container">
			<Header />
			<form name="invoice-form" className="invoice-form">
				<div style={{ display: 'none' }}>
					<img id="img" width="100" height="100" src={creativedaylogo} alt="invisible" />
					<img id="img-invoice" width="100" height="100" src={invoice} alt="invisible" />
					<img id="img-footer" width="100" height="100" src={footer} alt="invisible" />
					<img id="img-qr-code" width="100" height="100" src={QRcode} alt="invisible" />
				</div>
				<div style={{ display: 'flex', alignItems: 'center' }}>
					<NavLink to="/dashboard">
						<img src={arrowBox} width="30" height="30" />
					</NavLink>
					<div className="page-title" style={{ marginLeft: '1em' }}>
						Client Info
					</div>
				</div>
				<div className="client-info-inputs">
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
					<div onClick={() => checkPdf(items)} className="button">
						Create PDF
					</div>
				</div>
				{readyToUpload && (
					<div className="uploading-section">
						{uploadCompleted ? (
							<div>
								<NavLink to="/dashboard">Completed</NavLink>
							</div>
						) : (
							<div>Uploading</div>
						)}

						<div className="progress-bar" style={{ marginRight: '2em' }}>
							<div style={{ width: uploadedPercentage }} id="progress-bar-colored" />
						</div>
					</div>
				)}
				<div className="input-with-label">
					<input
						id="name-of-pdf"
						placeholder="test"
						onChange={(e) => setNameOfPDF(e.target.value)}
						value={nameOfPDF}
					/>
					<div className="file-extention">.pdf</div>
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
					<div>Total Balance ${calculateTotal().toFixed(2)}</div>
				</div>
				<div className="notes">
					<div
						style={{
							display: 'flex',
							justifyContent: 'space-between',
							alignItems: 'center',
							flexWrap: 'wrap'
						}}
					>
						<div className="note-title">Write a few notes</div>
						<div style={notes.length > maxNoteCharacters ? { color: '#ED4E58' } : {}}>
							{notes.length}/{maxNoteCharacters}
						</div>
					</div>
					<textarea
						className={`notes-input ${notes.length > maxNoteCharacters ? 'error' : ''}`}
						value={notes}
						onChange={(e) => setNotes(e.target.value)}
					/>
				</div>
			</form>
		</div>
	);
};
export default Dashboard;
