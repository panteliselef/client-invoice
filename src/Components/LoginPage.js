import React, { useState } from 'react';
import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/database';
import { validateEmail } from '../Utils/utils';
import RippledButton from '../Components/RippledButton';
import '../Assets/styles/login-page.css';
import { withRouter } from 'react-router-dom';

const LoginPage = (props) => {
	const [ userEmail, setUserEmail ] = useState('');
	const [ userPassword, setUserPassword ] = useState('');
	const [ errorMessage, setErrorMessage ] = useState('');

	const forgotPassword = () => {
		if (!firebase.auth().currentUser && validateEmail(userEmail)) {
			firebase
				.auth()
				.sendPasswordResetEmail(userEmail)
				.then(function() {
					// Email sent.
					alert("We've send you an email in order to reset your password ");
				})
				.catch(function(error) {
					console.log(error);
					// An error happened.
				});
		} else {
			setErrorMessage('Your email is invalid');
		}
	};

	const onSumbit = (e) => {
		e.preventDefault();
		console.log(userEmail, userPassword);
		firebase
			.auth()
			.setPersistence(firebase.auth.Auth.Persistence.LOCAL)
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
						setTimeout(() => {
							props.history.push('/dashboard');
						}, 100);
					})
					.catch((err) => {
						setErrorMessage(err.message);
						console.error(err);
					});
			})
			.catch(function(error) {
				setErrorMessage(error.message);
				console.error(error);
				// Handle Errors here.
				// var errorCode = error.code;
				// var errorMessage = error.message;
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
				<input type="email" onChange={(e) => setUserEmail(e.target.value)} placeholder="" value={userEmail} />
				<label>password</label>
				<input
					type="password"
					onChange={(e) => setUserPassword(e.target.value)}
					placeholder=""
					value={userPassword}
				/>
				<RippledButton onClick={(e) => onSumbit(e)} className="submit" color="#B7BFFF">
					log in
				</RippledButton>
				<div className="error-message">{errorMessage}</div>
				<div className="links">
					<RippledButton onClick={() => forgotPassword()} className="link" color="rgba(198, 175, 255, 1)">
						Forgot password
					</RippledButton>
					<RippledButton
						{...props}
						className="link"
						onClick={() => props.history.push('/signup')}
						color="rgba(198, 175, 255, 1)"
					>
						sign Up
					</RippledButton>
				</div>
			</form>
		</div>
	);
};

export default withRouter(LoginPage);
