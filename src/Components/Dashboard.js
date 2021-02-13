import React, { useEffect, useState } from 'react';
import { NavLink, withRouter } from 'react-router-dom';

// Utils
import { bytesToSize } from '../Utils/utils';

// Components
import Header from '../Components/Header';
import LoadingAnimation from '../Components/LoadingAnimation';

// Firebase
import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/database';
import 'firebase/storage';

// CSS
import '../Assets/styles/dashboard.css';


const Dashboard = ({globalState}) => {
	console.log(globalState)
	const [isFetchingData, setIsFetchingData] = useState(false); // hook: for displaying loading spinner while fetching data
	const [files, setFiles] = useState([]); // hook: array of user's files
	const user = firebase.auth().currentUser; // ref: firebase.user
	

	const [isDesktop, setDesktop] = useState(window.innerWidth > 800);

	const updateMedia = () => {
		setDesktop(window.innerWidth > 800);
	};

	useEffect(() => {
		window.addEventListener("resize", updateMedia);
		return () => window.removeEventListener("resize", updateMedia);
	});

	useEffect(
		() => {
			const database = firebase.database(); // ref: firebase.database
			const firebaseFiles = database.ref(`/files/${(globalState) ?
				globalState.signedInUserInfo.uid : ""}/invoices`); // ref: firebase database files path
		
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

			return function cleanup() {
				firebaseFiles.off();
				setIsFetchingData(false);
			};
		},
		[globalState]
	);


	const openPDF = async (event, pdfName) => {
		event.preventDefault();
		console.log(pdfName);
		let pdfRef = firebase.storage().ref(`/${user.uid}/invoices/${pdfName}`);

		return new Promise(async (resolve, reject) => {
			try {
				const url = await pdfRef.getDownloadURL();
				var win = window.open(url, '_blank');
				win.focus();
				resolve(url)
			} catch (error) {
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
				<div className="page-subtitle"> Welcome, {user?.displayName}</div>
				<NavLink to="/create-invoice">
					<div className="btn-rounded" style={{ marginLeft: 0, minWidth: '140px' }}>New Invoice</div>
				</NavLink>
				<div className="files-table">
					{isDesktop ?
						(<div className="entry-first">
							<div>name Of file</div>
							<div>Date updated</div>
							<div>Size</div>
						</div>) :
						<div className="entry-first">
							<div>name Of file</div>
							<div>Date updated</div>
						</div>
					}
					{isFetchingData ? (
						<LoadingAnimation />
					) : files.length === 0 ? (
						<div style={{ textAlign: "center", margin: "2em" }}>No files uploaded yet</div>
					) : (
								files.map(({ id, data }) => {
									let updatedData = new Date(data.updated);
									return isDesktop ? 
									<div key={id} className="entry">
											<div>{data.name}</div>
											<div>{updatedData.toLocaleString()}</div>
											<div className="number">{bytesToSize(data.size)}</div>
											<div className="link" onClick={async (e) => await openPDF(e, data.name)}>Open</div>
										</div>

									:
									<div key={id} className="entry"  onClick={async (e) => await openPDF(e, data.name)}>
											<div>{data.name}</div>
											<div>{updatedData.toLocaleDateString()}</div>
										</div>
										
									;
								})
							)}
				</div>
			</div>
		</div>
	);
};
export default withRouter(Dashboard);
