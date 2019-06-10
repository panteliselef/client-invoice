import React, { useReducer, useEffect } from 'react';
import './App.css';
import { BrowserRouter, Route, Switch,Redirect} from 'react-router-dom';
import firebase from 'firebase/app';
import 'firebase/database';
import 'firebase/auth';
import { firebaseConfig } from './firebaseConfig';
import LoginPage from './Components/LoginPage';
import SignupPage from './Components/SignupPage';
import Dashboard from './Components/Dashboard';
import CreateInvoice from './Components/CreateInvoice';
import { initState, mainReducer } from './Reducers/mainReducer';
import PrivateRoute from './Components/PrivateRoute';
firebase.initializeApp(firebaseConfig);

const App = (props) => {
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
				console.log('Signed In');
				dispatch({ type: 'UPDATED_USER_SIGNED_IN', payload: true });
			} else {
				console.log('no');
				dispatch({ type: 'UPDATED_USER_SIGNED_IN', payload: false });
			}
		});
	}, []);

	return (
		<BrowserRouter>
			{/* {state.isUserSignedIn ? <Redirect to="/dashboard" /> : <Redirect to="/" />} */}
			<Switch>
				<Route exact path="/" component={LoginPage} />
				<Route exact path="/login" component={LoginPage} />
				<Route exact path="/sign-up" component={SignupPage} />
				{/* <Route exact path="/dashboard" component={Dashboard} /> */}
				<Route exact path="/create-invoice" component={CreateInvoice} />
				<PrivateRoute state={state} exact path="/dashboard" component={Dashboard}/>
			</Switch>
		</BrowserRouter>
	);
};

export default App;
