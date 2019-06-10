import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/database';
import 'firebase/storage';
import '../Assets/dashboard.css';
const Dashboard = (props) => {
	const logout = () => {
		firebase
			.auth()
			.signOut()
			.then(function() {
				// Sign-out successful.
			})
			.catch(function(error) {
				// An error happened
			});
	};

	const [ files, setFiles ] = useState([]);
	const database = firebase.database();
	const user = firebase.auth().currentUser;
	console.log('Props', props);
	const firebaseFiles = database.ref(`/files/${props.data.signedInUserInfo.uid}/invoices`);

	useEffect(
		() => {
			let f = [];
			firebaseFiles.on('value', (snapshot) => {
				const fileObj = snapshot.val();
				if (fileObj) {
					const fileList = Object.keys(fileObj).map((key) => ({
						data: fileObj[key].metadata,
						id: key
					}));
					console.log(fileList);

					setFiles(fileList);
				}else{
					setFiles([]);
				}
				// snapshot.forEach((child) => {
				// 	console.log(child.val());
				// 	f.push({
				// 		id: child.key,
				// 		data: child.val().metadata
				// 	});
				// });
			});
		},
		[ user ]
	);
	function bytesToSize(bytes) {
   var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
   if (bytes == 0) return '0 Byte';
   var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
   return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
};
	return (
		<div className="dashboard-container">
			<div className="dashboard">
				<h1>Dashboard</h1>
				<button>
					<NavLink to="/create-invoice">Create new Invoice</NavLink>
				</button>
				<button onClick={() => logout()}>LogOut</button>
				<div className="files-table">
					{files.map(({ id, data }) => {
						let updatedData = new Date(data.updated);
						return (
							<div key={id} className="entry">
								<div>{data.name}</div>
								<div>{`${updatedData.getFullYear()}-${updatedData.getMonth()+1}-${updatedData.getDate()}`}</div>
								<div>{bytesToSize(data.size)}</div>
							</div>
						);
					})}
				</div>
			</div>
		</div>
	);
};
export default Dashboard;
