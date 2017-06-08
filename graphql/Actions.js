import { mutateDeleteQuay, mutateDeleteStopPlace } from './Mutations';
import {
  stopPlaceAndPathLinkByVersion,
  allVersionsOfStopPlace,
  stopPlaceFullSet,
} from '../graphql/Queries';

export const deleteQuay = (client, variables) => (
  client.mutate({
    mutation: mutateDeleteQuay,
    variables,
    fetchPolicy: 'network-only',
  })
);

export const deleteStopPlace = (client, stopPlaceId) => (
  client.mutate({
    mutation: mutateDeleteStopPlace,
    variables: {
      stopPlaceId
    }
  })
);

export const getStopPlaceVersions = (client, stopPlaceId) => (
  client.query({
    query: allVersionsOfStopPlace,
    variables: {
      id: stopPlaceId
    },
    fetchPolicy: 'network-only',
  })
);
