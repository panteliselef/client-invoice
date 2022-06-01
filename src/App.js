import React, {useReducer, useEffect, useContext} from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';

// Firebase
import firebase from 'firebase/app';
import 'firebase/database';
import 'firebase/auth';
import { firebaseConfig } from './firebaseConfig';


// Components
import LoginPage from './Components/LoginPage';
import SignupPage from './Components/SignupPage';
import Dashboard from './Components/Dashboard';
import CreateInvoice from './Components/CreateInvoice';
import CreateClient from './Components/CreateClient';

// HOC
import withAuthProtection from './HOC/withAuthProtection';
import afterAuthCompleted from './HOC/afterAuthCompleted';

// Reducer
import { initState, mainReducer } from './Reducers/mainReducer';
import { actions } from './Actions/mainActions'

// CSS
import './App.css';

const ProtectedDashboard = withAuthProtection('/login')(Dashboard)
const ProtectedEditor = withAuthProtection('/login')(CreateInvoice)
const ProtectedClientCreation = withAuthProtection('/login')(CreateClient)
const LimitedLoginPage = afterAuthCompleted('/dashboard')(LoginPage)
const LimitedSignUpPage = afterAuthCompleted('/dashboard')(SignupPage)

// initialize firebase
firebase.initializeApp(firebaseConfig);

export const AppContext = React.createContext({
	dispatch: () => null,
	state: initState
});

export const AppContextProvider = ({children}) => {
	const [globalState, dispatch] = useReducer(mainReducer, initState);
	return <AppContext.Provider value={{ state: globalState, dispatch }}>
		{children}
	</AppContext.Provider>
}




const App = () => {
	const {dispatch, state} = useContext(AppContext);

	useEffect(() => {
		firebase.auth().onAuthStateChanged(function (user) {
			console.log(user);
			if (user) {
				console.log('Signed In');
				dispatch({ type: actions.UPDATED_USER_INFO, payload: user });
				dispatch({ type: actions.UPDATED_USER_SIGNED_IN, payload: true });
			} else {
				console.log('no');
				dispatch({ type: actions.UPDATED_USER_INFO, payload: {} });
				dispatch({ type: actions.UPDATED_USER_SIGNED_IN, payload: false });
			}
		});
	}, [dispatch]);
	
	return (
		// <AppContext.Provider value={{ state: globalState, dispatch }}>
		<BrowserRouter>
			<Switch>
				<Route exact path="/login" render={(props) => (
					<LimitedLoginPage {...props} />
				)} />
				<Route exact path="/" render={(props) => (
					<LimitedLoginPage {...props} />
				)} />
				<Route exact path="/signup" render={(props) => (
					<LimitedSignUpPage {...props} />
				)} />
				<Route data={state} exact path="/dashboard" render={(props) => (
					<ProtectedDashboard globalState={state} dispatch={dispatch} {...props} />
				)} />
				<Route uid={state.signedInUserInfo.uid} exact path="/create-invoice" render={(props) => (
					<ProtectedEditor uid={state.signedInUserInfo.uid}  {...props} />
				)} />
        <Route uid={state.signedInUserInfo.uid} exact path="/create-client" render={(props) => (
					<ProtectedClientCreation uid={state.signedInUserInfo.uid}  {...props} />
				)} />


				{/* PATHS FOR TESTING */}

				{/* <Route exact path="/" component={LoginPage} /> */}
				{/* <Route exact path="/login" component={LoginPage} /> */}
				{/* <Route exact path="/sign-up" component={SignupPage} /> */}
				{/* <Route exact path="/dashboard" component={Dashboard} /> */}
				{/* <Route exact path="/create-invoice" component={CreateInvoice} /> */}

			</Switch>
		</BrowserRouter>
		// </AppContext.Provider>
	);
};

export default App;
