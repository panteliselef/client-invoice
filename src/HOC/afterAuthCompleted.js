import React from 'react';
import firebase from 'firebase/app';
import 'firebase/auth';
// create a function that take a path and then return HOC
// const withAuthProtection = redirectPath => HOC
const afterAuthCompleted = (redirectPath) => (WrappedComponent) => {
	class AfterAuthCompleted extends React.Component {
		componentDidUpdate() {
			console.log("DWA",redirectPath);
			const { history } = this.props;
			console.log(firebase.auth().currentUser);
			if (firebase.auth().currentUser) {
				// no auth at the beginning of the app, redirect them to login.
				return history.push(redirectPath);
			}
		}
		componentWillReceiveProps(nextProps) {
			// const { me, history } = this.props;
			// const { me: nextMe } = nextProps;
			// if (me && !nextMe) {
			//   // this case is a must,
			//   // if user stay at auth route while they signing out
			//   // we must take them to login again immediately.
			//   history.push(redirectPath)
			// }
		}
		render() {
			return <WrappedComponent {...this.props} />;
		}
	}

	return AfterAuthCompleted;
};

export default afterAuthCompleted;