import { ADD_WEB3_TO_STATE } from "../actions/actionTypes"

export default (state = {
  web3: {}
}, action) => {
  switch (action.type) {
  
    case ADD_WEB3_TO_STATE:
    return { web3: action.payload }
    default:
    return state
  }
 }