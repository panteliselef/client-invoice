import React from 'react';
import {Route,Redirect} from 'react-router-dom'

const PrivateRoute = ({component:Component,state:mState,...rest}) => {

  return(
    <Route {...rest} render={(props)=>{

      console.log("PRIVATE:",mState);
      return(
        mState.isUserSignedIn ?<Component {...props}/>
        : <Redirect to="/"/>
      )
    }}/>
  )
}

export default PrivateRoute;