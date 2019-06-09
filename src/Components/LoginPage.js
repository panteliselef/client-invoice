import React, { useState } from 'react';
import firebase from 'firebase/app';
import 'firebase/auth';

import '../Assets/login-page.css';
import { withRouter } from 'react-router-dom';

const LoginPage = (props) => {
	const [ userEmail, setUserEmail ] = useState('test@elefcodes.gr');
	const [ userPassword, setUserPassword ] = useState('123456');

	const onSumbit = (e) => {
		e.preventDefault();
		console.log(userEmail, userPassword);

		firebase
			.auth()
			.setPersistence(firebase.auth.Auth.Persistence.SESSION)
			.then(function() {
				// Existing and future Auth states are now persisted in the current
				// session only. Closing the window would clear any existing state even
				// if a user forgets to sign out.
				// ...
				// New sign-in will be persisted with session persistence.
				return firebase
					.auth()
					.signInWithEmailAndPassword(userEmail, userPassword)
					.then((success) => {
						console.log(success);
						props.history.push('/dashboard');
					})
					.catch((err) => {
						console.error(err);
					});
			})
			.catch(function(error) {
				// Handle Errors here.
				var errorCode = error.code;
				var errorMessage = error.message;
			});
	};
	return (
		<div className="login-page">
			<form className="sign-in">
				<div className="welcome-msg">
					<span role="img" aria-label="shh">
						🤫
					</span>{' '}
					Shh, don't tell anyone
				</div>
				<label>email</label>
				<input
					type="email"
					onChange={(e) => setUserEmail(e.target.value)}
					placeholder="email"
					value={userEmail}
				/>
				<label>password</label>
				<input
					type="password"
					onChange={(e) => setUserPassword(e.target.value)}
					placeholder="password"
					value={userPassword}
				/>
				<button className="submit" onClick={(e) => onSumbit(e)}>
					log in
				</button>
			</form>
		</div>
	);
};

export default withRouter(LoginPage);
