import React, { useState, useEffect } from 'react';
import firebase from 'firebase/app';
import 'firebase/database';
import 'firebase/auth';
import '../Assets/styles/login-page.css';
import { validateEmail } from '../Utils/utils';
import { withRouter, NavLink } from 'react-router-dom';
import RippledButton from './RippledButton';

const SignupPage = (props) => {
	const [ userEmail, setUserEmail ] = useState('');
	const [ userPassword, setUserPassword ] = useState('');
	const [ userFullName, setUserFullName ] = useState('');
	const [ errorMessage, setErrorMessage ] = useState('');
	const [ isSignUpAvailable, setSignUpAvailable ] = useState(false);
	const [ secretPasscode, setSecretPasscode ] = useState('@#');

	const user = firebase.auth().currentUser;
	const database = firebase.database();

	useEffect(
		() => {
			firebase.database().ref('/appInfo').on('value', (snapshot) => {
				console.error(snapshot.val());
				setSecretPasscode(snapshot.val().secretPasscode);
			});
		},
		[ user ]
	);

	const checkSecretPassCode = (e) => {
		e.preventDefault();
		if (secretPasscode === userPassword) {
			setErrorMessage('');
			setSignUpAvailable(true);
		} else {
			setErrorMessage('secret password is incorrect or undefined by admin');
		}
		setUserPassword('');
	};

	const writeUserData = (user) => {
		console.log(user);
		database.ref(`/users/${user.uid}/`).set({
			displayName: user.displayName,
			email: user.email,
			photoURL: user.photoURL,
			emailVerified: user.emailVerified,
			uid: user.uid
		}, function(error) {
			if (error) {
				// The write failed...
				console.error(error);
			} else {
				// Data saved successfully!
				console.log('User stored successfully');
			}
		});
	};

	const onSignUp = (e) => {
		e.preventDefault();
		console.log(userEmail, userPassword);

		if (userEmail !== '' && userFullName !== '' && userPassword !== '') {
			if (validateEmail(userEmail)) {
				firebase
					.auth()
					.createUserWithEmailAndPassword(userEmail, userPassword)
					.then((data) => {
						console.log('succes', data.user);
						data.user.updateProfile({
							displayName: userFullName
						});
						writeUserData(data.user);
					})
					.catch((err) => {
						console.error(err);
					});
			} else {
				setErrorMessage('Your email is invalid');
			}
		} else {
			setErrorMessage('Please fill all the required(*) fields');
		}
	};
	return (
		<div className="login-page">
			{isSignUpAvailable ? (
				<form className="sign-in">
					<div className="welcome-msg">
						<span role="img" aria-label="shh">
							🤫
						</span>{' '}
						Sign up Here
					</div>
					<label>Full Name *</label>
					<input
						type="text"
						onChange={(e) => setUserFullName(e.target.value)}
						placeholder=""
						value={userFullName}
					/>
					<label>email *</label>
					<input
						type="email"
						onChange={(e) => setUserEmail(e.target.value)}
						placeholder=""
						value={userEmail}
					/>
					<label>password *</label>
					<input
						type="password"
						onChange={(e) => setUserPassword(e.target.value)}
						placeholder=""
						value={userPassword}
					/>

					<RippledButton onClick={(e) => onSignUp(e)} className="submit" color="#B7BFFF">
						Sign Up
					</RippledButton>
					<div className="error-message">{errorMessage}</div>
					<div className="links">
						<NavLink className="link" to="/login">
							Already a member ?
						</NavLink>
					</div>
				</form>
			) : (
				<form className="sign-in">
					<div className="welcome-msg">
						{' '}
						Type the secret password to sign up{' '}
						<span role="img" aria-label="shh">
							🤫
						</span>
					</div>
					<input
						type="password"
						onChange={(e) => setUserPassword(e.target.value)}
						placeholder=""
						value={userPassword}
					/>
					<RippledButton onClick={(e) => checkSecretPassCode(e)} className="submit" color="#B7BFFF">
						Go to sign up Page
					</RippledButton>
					<div className="error-message">{errorMessage}</div>
				</form>
			)}
		</div>
	);
};

export default withRouter(SignupPage);
