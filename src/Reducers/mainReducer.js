import { actions } from '../Actions/mainActions';

export const initState = {
	signedInUserInfo: {},
	isUserSignedIn: false
};

export const mainReducer = (state, action) => {
	console.log('State', state, 'Action', action);
	switch (action.type) {
		case actions.UPDATED_USER_INFO: {
			return {
				...state,
				signedInUserInfo: action.payload
			};
		}
		case actions.UPDATED_USER_SIGNED_IN: {
			return {
				...state,
				isUserSignedIn: action.payload
			};
		}
	}
};
