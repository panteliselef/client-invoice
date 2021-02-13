import React from 'react';
import firebase from 'firebase/app';
import 'firebase/auth';
// create a function that take a path and then return HOC
// const withAuthProtection = redirectPath => HOC
const withAuthProtection = redirectPath => WrappedComponent => {
  class WithAuthProtection extends React.Component {

    componentDidMount() {
      // use history from parent.
      // console.log(redirectPath);
      // const { history } = this.props;
      // console.log(firebase.auth().currentUser);
      // if (!firebase.auth().currentUser) {
      //   // no auth at the beginning of the app, redirect them to login.
      //   return history.push(redirectPath)
      // }
    }
    componentDidUpdate() {
      const { history } = this.props;
      console.log(firebase.auth().currentUser);
      if (!firebase.auth().currentUser) {
        // no auth at the beginning of the app, redirect them to login.
        return history.push(redirectPath)
      }
    }
    render() {
      return <WrappedComponent {...this.props} />
    }
  }

  return WithAuthProtection
}

export default withAuthProtection;