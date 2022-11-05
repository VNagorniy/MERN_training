import { applyMiddleware, combineReducers, createStore } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import thunk from 'redux-thunk';
import fileReducer from './fileReducer';
import userReducer from './userReducers';
import uploadReducer from './uploadReducer';
import appReducer from './appReducer';

// Корневой reducer

const rootReducer = combineReducers({
  user: userReducer,
  files: fileReducer,
  upload: uploadReducer,
  app: appReducer,
});

//Создаём store принимает (корневой reducer, middleware)

export const store = createStore(rootReducer, composeWithDevTools(applyMiddleware(thunk)));
