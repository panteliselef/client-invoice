import React, { useEffect, useState } from 'react';
import { NavLink, withRouter } from 'react-router-dom';
import firebase from 'firebase/app';
import {bytesToSize} from '../Utils/utils';
import Header from '../Components/Header';
import LoadingAnimation from '../Components/LoadingAnimation';
import 'firebase/auth';
import 'firebase/database';
import 'firebase/storage';
import '../Assets/styles/dashboard.css';
const Dashboard = (props) => {
	const [ isFetchingData, setIsFetchingData ] = useState(false); // hook: for displaying loading spinner while fetching data
	const [ files, setFiles ] = useState([]); // hook: array of user's files
	const [displayName,setDisplayName] = useState('...'); // hook: display name of user 
	const database = firebase.database(); // ref: firebase.database
	const user = firebase.auth().currentUser; // ref: firebase.user
	const firebaseFiles = database.ref(`/files/${ (props.data ) ?
		props.data.signedInUserInfo.uid : "" }/invoices`); // ref: firebase database files path


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


	const openPDF = async (event, pdfName) => {
		event.preventDefault();
		console.log(pdfName);
		let pdfRef = firebase.storage().ref(`/${user.uid}/invoices/${pdfName}`);

		return new Promise(async (resolve,reject) => {
			try{
				const url = await pdfRef.getDownloadURL();
				var win = window.open(url, '_blank');
				win.focus();
				resolve(url)
			}catch(error) {
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
					default: 
						// do nothing
				}
				reject(error.code)
			}
		})
	};
	return (
		<div className="container">
			<Header />
			<div className="dashboard">
				<div className="page-title"> Dashboard</div>
				<div className="page-subtitle"> Welcome, {displayName}</div>
				<NavLink to="/create-invoice">
					<div className="btn-rounded" style={{marginLeft:0, minWidth:'140px'}}>New Invoice</div>
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
									<div>{updatedData.toLocaleString()}</div>
									<div className="number">{bytesToSize(data.size)}</div>
									<div className="link" onClick={async (e) => await openPDF(e, data.name)}>Open</div>
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
