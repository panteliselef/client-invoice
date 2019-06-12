import React, { useState, useEffect } from 'react';
import firebase from 'firebase/app';
import 'firebase/database';
import 'firebase/auth';
import '../Assets/login-page.css';
import { withRouter, NavLink } from 'react-router-dom';

const SignupPage = (props) => {
	const [ userEmail, setUserEmail ] = useState('panteliselef@outlook.com');
	const [ userPassword, setUserPassword ] = useState(''); //123456

	const [ isSignUpAvailable, setSignUpAvailable ] = useState(false);

	const [ secretPasscode, setSecretPasscode ] = useState('');

	const user = firebase.auth().currentUser;
	const database = firebase.database();
	// const passcode = database.ref('/appInfo/secretPasscode');
	const firebaseFiles = database.ref(`/files`);

	const validateEmail = (email) => {
		var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
		return re.test(email);
	};
	useEffect(
		() => {
			firebase.database().ref('/appInfo').on('value', (snapshot) => {
				console.warn(snapshot.val());
				setSecretPasscode(snapshot.val().secretPasscode);
			});
		},
		[ user ]
	);

	const checkSecretPassCode = (e) => {
		e.preventDefault();
		if (secretPasscode === userPassword) setSignUpAvailable(true);
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

		if (validateEmail(userEmail)) {
			firebase
				.auth()
				.createUserWithEmailAndPassword(userEmail, userPassword)
				.then((data) => {
					console.log('succes', data.user);
					writeUserData(data.user);
					// props.history.push('/dashboard');
				})
				.catch((err) => {
					console.error(err);
				});
		} else {
			console.error('invalid email');
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
					<label>email</label>
					<input
						type="email"
						onChange={(e) => setUserEmail(e.target.value)}
						placeholder=""
						value={userEmail}
					/>
					<label>password</label>
					<input
						type="password"
						onChange={(e) => setUserPassword(e.target.value)}
						placeholder=""
						value={userPassword}
					/>
					<button className="submit" onClick={(e) => onSignUp(e)}>
						Sign Up
					</button>
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
					<button className="submit" onClick={(e) => checkSecretPassCode(e)}>
						Go to sign up Page
					</button>
				</form>
			)}
		</div>
	);
};

export default withRouter(SignupPage);
