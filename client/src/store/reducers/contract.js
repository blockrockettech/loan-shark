import { ADD_CONTRACT_TO_STATE } from "../actions/actionTypes"

export default (state = {
  contract: {}
}, action) => {
  switch (action.type) {
  
    case ADD_CONTRACT_TO_STATE:
    return { contract: action.payload }
    default:
    return state
  }
 }