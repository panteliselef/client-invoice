// https://coolors.co/8c99ff-c6afff-b596ff-192466-fff4fa
import React, { useState } from 'react';
import jsPDF from 'jspdf';
import firebase from 'firebase/app';
import 'firebase/storage';
import creativedaylogo from '../Assets/creativedaylogo.png';
import invoice from '../Assets/invoice.png';
const Dashboard = () => {
	const [ clientInfo, setClientInfo ] = useState({
		name: '',
		address: '',
		city: ''
	});

	const [ items, setItems ] = useState([
		{
			id: 1,
			description: 'This is a Test Description',
			price: 0.99
		}
	]);

	const [readyToUpload, setReadyToUpload] = useState(false);
	const [uploadedPercentage,setUploadedPercentage] = useState(0);
	const [uploadCompleted,setUploadCompleted] = useState(false);
	


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

	const uploadPDF = (file) => {

		setReadyToUpload(true);
		let storageRef = firebase.storage().ref('test/one');
		let task = storageRef.put(file);
		task.on('state_changed', function progress(snapshot){
			let percentage = snapshot.bytesTransferred/snapshot.totalBytes *100;
			console.log(percentage);
			setUploadedPercentage(percentage);
		},
			function error(err) {
				console.error(err);
			},
			function completed() {
				document.getElementById('progress-bar-colored').style.backgroundColor = "#192466"
				setUploadCompleted(true);
			}
		)


	}

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

	const createPDF = () => {
		let doc = new jsPDF({
			orientation: 'p',
			unit: 'px',
			foqrmat: 'a4'
		});

		doc.addImage(document.getElementById('img'), 'PNG', doc.internal.pageSize.getWidth() / 2 - 50, 20, 100, 20,"wf","FAST");

		doc.addImage(document.getElementById('img-invoice'), 'PNG', 0, 80, doc.internal.pageSize.getWidth(), 100,"dwa","FAST");

		doc.setFontSize(25);
    doc.text(doc.internal.pageSize.getWidth() / 2 - 35, 110, 'BILL TO:');
    
		// console.log(doc.output('datauristring', 'filename.pdf'));
		// let file = doc.save('one.pdf');
		let file = doc.output('blob');
		uploadPDF(file);
		// var data = new FormData();
		//     data.append("data" , file);
		// console.log(file)

		// let storageRef = firebase.storage().ref('test/one');
		// let task = storageRef.put(file);

		// task.on('state_changed', function progress(snapshot){
		//   let percentage = snapshot.bytesTransferred/snapshot.totalBytes *100;
		//   console.log(percentage);
		// })
	};

	return (
		<form name="invoice-form" className="invoice-form">
			<img id="img" width="100" height="100" src={creativedaylogo} />
			<img id="img-invoice" width="100" height="100" src={invoice} />
			<div className="client-info-inputs">
				<h2>Client Info</h2>
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


				<div style={{width:'100%',display:'flex',alignItems:'center',justifyContent:'flex-end'}}>

				{(uploadCompleted &&
					<div>Completed</div>
				)}
				{(readyToUpload &&  
					<div className="progress-bar">
						<div style={{width:uploadedPercentage}} id="progress-bar-colored"></div>
					</div>
				)}
					<div onClick={() => createPDF()} className="button">
						Create PDF
					</div>
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
								/>
							</div>
						</div>
					);
				})}
			</div>
			<div className="client-total-bill">
				<div>Total Balance {calculateTotal()}€</div>
			</div>
		</form>
	);
};
export default Dashboard;
