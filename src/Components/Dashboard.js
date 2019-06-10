import React, {useEffect} from 'react';
import { NavLink } from 'react-router-dom';
import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/storage';
import '../Assets/dashboard.css'
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

	useEffect(()=>{
		console.log("Hey");
	},[])

	return (
		<div className="dashboard-container">
			<div className="dashboard">
				<h1>Dashboard</h1>
				<button>
					<NavLink to="/create-invoice">Create new Invoice</NavLink>
				</button>
				<button onClick={() => logout()}>LogOut</button>

			</div>
		</div>

		
	);
};
export default Dashboard;
