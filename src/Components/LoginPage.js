import React, {useState}from 'react';
import firebase from 'firebase/app'
import 'firebase/auth';
import { withRouter } from 'react-router-dom';

const LoginPage = (props) => {
  const [userEmail,setUserEmail] = useState("test@elefcodes.gr");
  const [userPassword,setUserPassword] = useState("123456");

  const onSumbit = () => {
    console.log(userEmail,userPassword)
    firebase.auth().signInWithEmailAndPassword(
      userEmail,
      userPassword
    ).then( (success) => {
      console.log(success);
      props.history.push('/dashboard');
    }).catch(err=>{
      console.error(err)
    })
  }
  return (
    <div>
      <input type="email" onChange={(e)=>setUserEmail(e.target.value)} placeholder="email" value={userEmail}></input>
      <input type="password" onChange={(e)=>setUserPassword(e.target.value)} placeholder="password" value={userPassword}></input>
      <button onClick={()=> onSumbit()}>Submit</button>
      {userEmail}
    </div>
  )
}

export default withRouter(LoginPage);