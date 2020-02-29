import { ADD_TOKENS_TO_STATE, ADD_WEB3_TO_STATE, ADD_CONTRACT_TO_STATE } from "./actionTypes"

export const addTokens = tokens => ({
   type: ADD_TOKENS_TO_STATE,
   payload: tokens
  })
 

 export const addWeb3 = web3 => ({
   type: ADD_WEB3_TO_STATE,
   payload: web3
  })
 

 export const addContract = contract => ({
   type: ADD_CONTRACT_TO_STATE,
   payload: contract
  })
