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
			.signInWithEmailAndPassword(userEmail, userPassword)
			.then((success) => {
				console.log(success);
				props.history.push('/dashboard');
			})
			.catch((err) => {
				console.error(err);
			});
	};
	return (
		<div className="login-page">
			<form className="sign-in">
				<div className="welcome-msg"><span role="img" aria-label="shh">🤫</span> Shh, don't tell anyone</div>
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
				<button className="submit" onClick={(e) => onSumbit(e)}>log in</button>
			</form>
		</div>
	);
};

export default withRouter(LoginPage);
