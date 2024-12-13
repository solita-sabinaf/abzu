/*
 *  Licensed under the EUPL, Version 1.2 or – as soon they will be approved by
the European Commission - subsequent versions of the EUPL (the "Licence");
You may not use this work except in compliance with the Licence.
You may obtain a copy of the Licence at:

  https://joinup.ec.europa.eu/software/page/eupl

Unless required by applicable law or agreed to in writing, software
distributed under the Licence is distributed on an "AS IS" basis,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the Licence for the specific language governing permissions and
limitations under the Licence. */

import * as types from "../actions/Types";
import {
  getAllowanceInfoForGroup,
  getAllowanceSearchInfo,
  getAllowanceInfoForStop,
  reduceFetchedPolygons,
} from "./rolesReducerUtils";

export const initialState = {
  auth: {},
  fetchedPolygons: null,
  isGuest: true,
  allowNewStopEverywhere: false,
};

const rolesReducer = (state = initialState, action) => {
  switch (action.type) {
    case types.APOLLO_QUERY_RESULT:
      if (action.operationName === "stopPlaceAndPathLink") {
        return Object.assign({}, state, {
          allowanceInfo: getAllowanceInfoForStop(action),
        });
      } else if (action.operationName === "getGroupOfStopPlaces") {
        return Object.assign({}, state, {
          allowanceInfo: getAllowanceInfoForGroup(action),
        });
      } else if (action.operationName === "getPolygons") {
        return Object.assign({}, state, {
          fetchedPolygons: reduceFetchedPolygons(action.result),
        });
      } else if (action.operationName === "getLocationPermissions") {
        return Object.assign({}, state, {
          allowanceInfo: getAllowanceInfoFromLocationPermissions(
            action.result.data.locationPermissions,
          ),
        });
      } else if (action.operationName === "getUserPermissions") {
        return Object.assign({}, state, {
          isGuest: action.result.data.userPermissions.isGuest,
          allowNewStopEverywhere:
            action.result.data.userPermissions.allowNewStopEverywhere,
        });
      } else {
        return state;
      }

    case types.SET_ACTIVE_MARKER:
      return Object.assign({}, state, {
        allowanceInfoSearchResult: getAllowanceSearchInfo(
          action.payload,
          state.auth.roleAssignments,
        ),
      });

    case types.UPDATED_AUTH:
      return Object.assign({}, state, {
        auth: action.payload,
      });

    case types.UPDATED_ALLOW_NEW_STOPS_EVERYWHERE:
      return Object.assign({}, state, {
        allowNewStopEverywhere: action.payload,
      });
    default:
      return state;
  }
};

export default rolesReducer;
