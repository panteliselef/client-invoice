import React from 'react';
import firebase from 'firebase/app';
import 'firebase/auth';
import '../Assets/styles/header.css';

const Header = () => {
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
		<div className="header">
			<ul>
				<li onClick={()=>logout()}>Log Out</li>
			</ul>
		</div>
	);
};

export default Header;
