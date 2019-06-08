import React from 'react';
import './App.css';
import {BrowserRouter, Route, Switch} from 'react-router-dom';
import firebase from 'firebase/app'
import 'firebase/database';
import 'firebase/auth';
import {firebaseConfig} from './firebaseConfig'
import LoginPage from './Components/LoginPage'
import Dashboard from './Components/Dashboard'
import CreateInvoice from './Components/CreateInvoice'

firebase.initializeApp(firebaseConfig);
const database = firebase.database();

class App extends React.Component {
  constructor(props) {
    super(props)
    this.state = {}
    this.test = database.ref('/');
  }


  componentDidMount() {
    console.log(firebase);
    this.test.on('value', (snapshot) => {
      console.log(snapshot.val());
    })
  }

  render(){
    return (
      <BrowserRouter>
        <Switch>
          <Route exact path='/' component={LoginPage} />
          <Route exact path='/dashboard'  component={Dashboard} />
          <Route exact path='/create-invoice'  component={CreateInvoice} />
        </Switch>
      </BrowserRouter>
    );
  }
}

export default App;
