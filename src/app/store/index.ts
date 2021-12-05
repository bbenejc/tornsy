import { createStore } from 'redux';
import { reducer } from './reducer';

export * from './actions';
export * from './selectors';
export const store = createStore(reducer);

export type TStore = ReturnType<typeof reducer>;
