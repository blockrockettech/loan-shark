import { combineReducers } from 'redux'
import tokenReducer from './tokens'
import contractReducer from './contract'
import web3Reducer from './web3'

export default combineReducers({
 tokenReducer,
 contractReducer,
 web3Reducer
})