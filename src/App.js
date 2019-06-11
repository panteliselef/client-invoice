import React, { useReducer, useEffect } from 'react';
import './App.css';
import { BrowserRouter, Route, Switch} from 'react-router-dom';
import firebase from 'firebase/app';
import 'firebase/database';
import 'firebase/auth';
import { firebaseConfig } from './firebaseConfig';
import LoginPage from './Components/LoginPage';
import SignupPage from './Components/SignupPage';
import Dashboard from './Components/Dashboard';
import CreateInvoice from './Components/CreateInvoice';
import { initState, mainReducer } from './Reducers/mainReducer';

import withAuthProtection from './HOC/withAuthProtection';
import afterAuthCompleted from './HOC/afterAuthCompleted';
const ProtectedDashboard = withAuthProtection('/login')(Dashboard)
const ProtectedEditor = withAuthProtection('/login')(CreateInvoice)
const LimitedLoginPage = afterAuthCompleted('/dashboard')(LoginPage)
const LimitedSignUpPage = afterAuthCompleted('/dashboard')(SignupPage)
firebase.initializeApp(firebaseConfig);

const App = (props) => {
	const database = firebase.database();
	const [ state, dispatch ] = useReducer(mainReducer, initState);

	function authUser() {
   return new Promise(function (resolve, reject) {
      firebase.auth().onAuthStateChanged(function(user) {
         if (user) {
            resolve(user);
         } else {
            reject('User not logged in');
         }             
      });
   });
}

	useEffect(() => {
		firebase.auth().onAuthStateChanged(function(user) {
			console.log(user);
			if (user) {
				console.log('Signed In');
				
				dispatch({ type: 'UPDATED_USER_INFO', payload: user });
				dispatch({ type: 'UPDATED_USER_SIGNED_IN', payload: true });
			} else {
				console.log('no');
				dispatch({ type: 'UPDATED_USER_INFO', payload: {} });
				dispatch({ type: 'UPDATED_USER_SIGNED_IN', payload: false });
			}
		});
	}, []);	
	return (
		<BrowserRouter>
			{/* {state.isUserSignedIn ? <Redirect to="/dashboard" /> : <Redirect to="/" />} */}
			<Switch>
			<Route exact path="/login" render={(props)=>(
          <LimitedLoginPage {...props}/>
        )}/>
				<Route exact path="/" render={(props)=>(
          <LimitedLoginPage {...props}/>
        )}/>
				<Route exact path="/sign-up" render={(props)=>(
          <LimitedSignUpPage {...props}/>
        )}/>
				{/* <Route exact path="/" component={LoginPage} /> */}
				{/* <Route exact path="/login" component={LoginPage} /> */}
				{/* <Route exact path="/sign-up" component={SignupPage} /> */}
				{/* <Route exact path="/dashboard" component={Dashboard} /> */}
				{/* <Route exact path="/create-invoice" component={CreateInvoice} /> */}
				<Route data={state} exact path="/dashboard" render={(props)=>(
          <ProtectedDashboard data={state} {...props}/>
        )}/>
				<Route exact path="/create-invoice" render={(props)=>(
          <ProtectedEditor {...props}/>
        )}/>
			</Switch>
		</BrowserRouter>
	);
};

export default App;
