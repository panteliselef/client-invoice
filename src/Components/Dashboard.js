import React from 'react';
import { NavLink } from 'react-router-dom';
import firebase from 'firebase/app';
import 'firebase/auth';
const Dashboard = () => {
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

	return (
		<div>
			<h1>Dashboard</h1>
			<button>
				<NavLink to="/create-invoice">Create new Invoice</NavLink>
			</button>
			<button onClick={() => logout()}>LogOut</button>
		</div>
	);
};
export default Dashboard;
