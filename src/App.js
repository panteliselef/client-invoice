import React, { useReducer, useEffect } from 'react';
import './App.css';
import { BrowserRouter, Route, Switch, Redirect } from 'react-router-dom';
import firebase from 'firebase/app';
import 'firebase/database';
import 'firebase/auth';
import { firebaseConfig } from './firebaseConfig';
import LoginPage from './Components/LoginPage';
import Dashboard from './Components/Dashboard';
import CreateInvoice from './Components/CreateInvoice';
import { initState, mainReducer } from './Reducers/mainReducer';
firebase.initializeApp(firebaseConfig);

const App = () => {
	const database = firebase.database();
	const test = database.ref('/');
	const [ state, dispatch ] = useReducer(mainReducer, initState);

	// componentDidMount() {
	//   console.log(firebase);
	//   this.test.on('value', (snapshot) => {
	//     console.log(snapshot.val());
	//   })
	// }

	useEffect(() => {
		firebase.auth().onAuthStateChanged(function(user) {
			console.log(user);
			if (user) {
				console.log('aw');
				dispatch({ type: 'UPDATED_USER_SIGNED_IN', payload: true });
			} else {
				console.log('no');
				dispatch({ type: 'UPDATED_USER_SIGNED_IN', payload: false });
			}
		});
	}, []);

	return (
		<BrowserRouter>
			{state.isUserSignedIn ? <Redirect to="/dashboard" /> : <Redirect to="/" />}
			<Switch>
				<Route exact path="/" component={LoginPage} />
				<Route exact path="/dashboard" component={Dashboard} />
				<Route exact path="/create-invoice" component={CreateInvoice} />
			</Switch>
		</BrowserRouter>
	);
};

export default App;
