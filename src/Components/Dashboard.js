import React, { useEffect, useState } from 'react';
import { NavLink, withRouter } from 'react-router-dom';
import firebase, { storage } from 'firebase/app';
import Header from '../Components/Header';
import LoadingAnimation from '../Components/LoadingAnimation';
import 'firebase/auth';
import 'firebase/database';
import 'firebase/storage';
import '../Assets/dashboard.css';
const Dashboard = (props) => {
	const [ files, setFiles ] = useState([]);
	const database = firebase.database();
	const user = firebase.auth().currentUser;
	const [displayName,setDisplayName] = useState('...');
	console.log('Props', props);
	const firebaseFiles = database.ref(`/files/${ (props.data ) ?
		props.data.signedInUserInfo.uid : "" }/invoices`);

	
	const [ isFetchingData, setIsFetchingData ] = useState(false);

	useEffect(
		() => {
			setIsFetchingData(true);
			firebaseFiles.on('value', (snapshot) => {
				const fileObj = snapshot.val();
				if (fileObj) {
					const fileList = Object.keys(fileObj).map((key) => ({
						data: fileObj[key].metadata,
						id: key
					}));
					console.log(fileList);
					setFiles(fileList);
					setIsFetchingData(false);
				} else {
					setFiles([]);
					setIsFetchingData(false);
				}
			});

			
			setDisplayName(props.data.signedInUserInfo.displayName);

			return function cleanup() {
				firebaseFiles.off();
				setIsFetchingData(false);
			};
		},
		[ user ]
	);
	const bytesToSize = (bytes) => {
		var sizes = [ 'Bytes', 'KB', 'MB', 'GB', 'TB' ];
		if (bytes === 0) return '0 Byte';
		var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
		return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
	};

	const downloadPDF = (event, pdfName) => {
		event.preventDefault();
		console.log(pdfName);
		let pdfRef = firebase.storage().ref(`/${user.uid}/invoices/${pdfName}`);
		pdfRef
			.getDownloadURL()
			.then((url) => {
				console.log(url);
				window.location = url;
				console.log('END');
			})
			.catch((error) => {
				console.error(error);
				switch (error.code) {
					case 'storage/object-not-found':
						// File doesn't exist
						break;

					case 'storage/unauthorized':
						// User doesn't have permission to access the object
						break;

					case 'storage/canceled':
						// User canceled the upload
						break;
					case 'storage/unknown':
						// Unknown error occurred, inspect the server response
						break;
				}
			});
	};
	return (
		<div className="container">
			<Header />
			<div className="dashboard">
				<div className="page-title"> Dashboard</div>
				{/* {displayName !== '' && (
				)} */}
				<div className="page-subtitle"> Welcome, {displayName}</div>
				<NavLink to="/create-invoice">
					<button className="btn-rounded">Create new Invoice</button>
				</NavLink>
				<div className="files-table">
					<div className="entry-first">
						<div>name Of file</div>
						<div>Date updated</div>
						<div>Size</div>
					</div>
					{isFetchingData ? (
						<LoadingAnimation />
					) : files.length === 0 ? (
						<div style={{textAlign:"center",margin:"2em"}}>No files uploaded yet</div>
					) : (
						files.map(({ id, data }) => {
							let updatedData = new Date(data.updated);
							return (
								<div key={id} className="entry">
									<div>{data.name}</div>
									{/* <div>{`${updatedData.getFullYear()}-${updatedData.getMonth() +
										1}-${updatedData.getDate()}__ ${updatedData.toLocaleString()}`}</div> */}
									<div>{updatedData.toLocaleString()}</div>
									<div>{bytesToSize(data.size)}</div>
									<div onClick={(e) => downloadPDF(e, data.name)}>Open</div>
								</div>
							);
						})
					)}
				</div>
			</div>
		</div>
	);
};
export default withRouter(Dashboard);
