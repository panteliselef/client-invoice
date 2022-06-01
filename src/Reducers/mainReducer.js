import {actions} from '../Actions/mainActions';
import {categoryOptions} from "../Utils/utils";

export const initState = {
    signedInUserInfo: {},
    isUserSignedIn: false,
    activeCategory: categoryOptions[0]
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
        case actions.UPDATED_CATEGORY: {
            return {
                ...state,
                activeCategory: action.payload
            }
        }
        default: {
            return;
        }
    }
};

const d = {
    initState,
    mainReducer
}

export default d;
