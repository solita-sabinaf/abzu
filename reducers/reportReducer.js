import * as types from '../actions/Types';
import formatHelpers from '../modelUtils/mapToClient';

export const initialState = {
  topographicalPlaces: [],
  results: [],
};

const reportReducer = (state = initialState, action) => {
  switch (action.type) {
    case types.APOLLO_QUERY_RESULT:
      if (action.operationName === 'TopopGraphicalPlacesForReport') {
        return reduceTopopGraphicalPlacesForReport(state, action);
      } else if (action.operationName === 'findStopForReport') {
        return reduceSearchResultsForReport(state, action);
        // Used for adding parking elements to stopPlaces
      } else if (action.operationName === '') {
        return populateStopPlacesWithParking(state, action.result.data);
      } else {
        return state;
      }

    default:
      return state;
  }
};

const reduceTopopGraphicalPlacesForReport = (state, action) => {
  return Object.assign({}, state, {
    topographicalPlaces: action.result.data.topographicPlace,
  });
};

const reduceSearchResultsForReport = (state, action) => {
  return Object.assign({}, state, {
    results: formatHelpers.mapReportSearchResultsToClientStop(
      action.result.data.stopPlace,
    ),
  });
};

const populateStopPlacesWithParking = (state, results) => {
  const stopPlaces = state.results;
  let stopPlacesWithParking = stopPlaces.map(stopPlace => {
    let aliasedId = stopPlace.id.replace('NSR:StopPlace:', 'StopPlace');
    return Object.assign({}, stopPlace, {
      parking: results[aliasedId],
    });
  });

  return Object.assign({}, state, {
    results: stopPlacesWithParking,
  });
};

export default reportReducer;
