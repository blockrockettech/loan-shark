import {ADD_TOKENS_TO_STATE } from "../actions/actionTypes"

export default (state = {
  tokens: []
}, action) => {
  switch (action.type) {
  
    case ADD_TOKENS_TO_STATE:
    return {tokens: action.payload }
    default:
    return state
  }
 }