import { createContext, useContext, useMemo, useReducer } from 'react';
import { EVENT_FILTERS } from '../utils/constants';

const initialState = {
  filter: EVENT_FILTERS.upcoming,
  search: '',
  selectedEventId: null,
  pinnedEvents: []
};

const EventContext = createContext(initialState);

const reducer = (state, action) => {
  switch (action.type) {
    case 'SET_FILTER':
      return { ...state, filter: action.payload };
    case 'SET_SEARCH':
      return { ...state, search: action.payload };
    case 'SET_SELECTED_EVENT':
      return { ...state, selectedEventId: action.payload };
    case 'PIN_EVENT':
      return {
        ...state,
        pinnedEvents: state.pinnedEvents.includes(action.payload)
          ? state.pinnedEvents
          : [...state.pinnedEvents, action.payload]
      };
    case 'UNPIN_EVENT':
      return {
        ...state,
        pinnedEvents: state.pinnedEvents.filter((id) => id !== action.payload)
      };
    default:
      return state;
  }
};

export const EventProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const value = useMemo(
    () => ({
      ...state,
      setFilter: (filter) => dispatch({ type: 'SET_FILTER', payload: filter }),
      setSearch: (search) => dispatch({ type: 'SET_SEARCH', payload: search }),
      setSelectedEventId: (id) => dispatch({ type: 'SET_SELECTED_EVENT', payload: id }),
      pinEvent: (id) => dispatch({ type: 'PIN_EVENT', payload: id }),
      unpinEvent: (id) => dispatch({ type: 'UNPIN_EVENT', payload: id })
    }),
    [state]
  );

  return <EventContext.Provider value={value}>{children}</EventContext.Provider>;
};

export const useEvents = () => useContext(EventContext);
