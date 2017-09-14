import moment from 'moment';
import { defaultLimitations } from '../models/Limitations';

const helpers = {};

helpers.mapQuayToVariables = quay => {
  let quayVariables = {
    id: quay.id,
    geometry: null,
    compassBearing: quay.compassBearing,
    publicCode: quay.publicCode,
    accessibilityAssessment: formatAccessibilityAssements(
      quay.accessibilityAssessment
    ),
    keyValues: quay.keyValues,
    placeEquipments: quay.placeEquipments,
    description: {
      value: quay.description,
      lang: 'no'
    }
  };

  quayVariables.privateCode = {
    value: quay.privateCode || '',
  };

  if (quay.location) {
    quayVariables.geometry = {
      coordinates: [[quay.location[1], quay.location[0]]],
      type: 'Point'
    };
  }
  return quayVariables;
};

helpers.getFullUTCString = (time, date) => {
  const timeString = moment(time).utc().format('HH:mm:ss');
  // Do not format this to UTC in order to retain correct date, 2017-09-1500:02+GMT will be 2017-08... in UTC
  const dateString = moment(date).format('YYYY-MM-DD');
  return (
    moment(`${dateString} ${timeString}`).format(
      'YYYY-MM-DDTHH:mm:ss.SSS'
    ).toString() + 'Z'
  );
};

helpers.mapChildStopToVariables = (original, userInput) => {
  const stop = JSON.parse(JSON.stringify(original));

  const child = helpers.mapDeepStopToVariables(original, null);

  let variables = {
    id: stop.parentStop.id,
    children: [child],
    name: stop.parentStop.name
  };

  if (stop.parentStop.location) {
    variables.coordinates = [[stop.parentStop.location[1], stop.parentStop.location[0]]];
  }

  if (userInput) {
    const { timeFrom, timeTo, dateFrom, dateTo, comment } = userInput;

    console.log("userInput", userInput);

    let validPeriod = {};

    if (timeFrom && dateFrom) {
      validPeriod.fromDate = helpers.getFullUTCString(timeFrom, dateFrom);
    }

    if (timeTo && dateTo) {
      validPeriod.toDate = helpers.getFullUTCString(timeTo, dateTo);
    }

    variables.validBetween = validPeriod;

    variables.versionComment = comment;
  }

  return variables;
}

helpers.mapParentStopToVariables = (original, userInput) => {
  const stop = JSON.parse(JSON.stringify(original));

  let parentStopVariables = {
    name: stop.name,
    description: stop.description || null,
  };

  if (stop.id) {
    parentStopVariables.id = stop.id;
  } else {
    parentStopVariables.stopPlaceIds = stop.children.map( child => child.id )
  }

  if (stop.location) {
    parentStopVariables.coordinates = [[stop.location[1], stop.location[0]]];
  }

  if (userInput) {
    const { timeFrom, timeTo, dateFrom, dateTo, comment } = userInput;

    let validPeriod = {};

    if (timeFrom && dateFrom) {
      validPeriod.fromDate = helpers.getFullUTCString(timeFrom, dateFrom);
    }

    if (timeTo && dateTo) {
      validPeriod.toDate = helpers.getFullUTCString(timeTo, dateTo);
    }

    parentStopVariables.validBetween = validPeriod;

    parentStopVariables.versionComment = comment;
  }

  return parentStopVariables;
};

const createEmbeddableMultilingualString = string => ({
  value: string || '',
  lang: 'no'
});

// properly maps object when Object is used as InputObject and not shallow variables for query
helpers.mapDeepStopToVariables = original => {
  let stopPlace = helpers.mapStopToVariables(original, null);
  stopPlace.name = createEmbeddableMultilingualString(stopPlace.name);
  stopPlace.description = createEmbeddableMultilingualString(stopPlace.description);

  if (stopPlace.coordinates) {
    stopPlace.geometry = {
      coordinates: stopPlace.coordinates.slice(),
      type: 'Point'
    }
    delete stopPlace.coordinates;
  }
  return stopPlace;
}

helpers.mapStopToVariables = (original, userInput) => {
  const stop = JSON.parse(JSON.stringify(original));

  let stopVariables = {
    id: stop.id,
    name: stop.name,
    description: stop.description || null,
    stopPlaceType: stop.stopPlaceType,
    quays: stop.quays.map(quay => helpers.mapQuayToVariables(quay)),
    accessibilityAssessment: formatAccessibilityAssements(
      stop.accessibilityAssessment
    ),
    keyValues: stop.keyValues,
    placeEquipments: stop.placeEquipments,
    alternativeNames: stop.alternativeNames,
    weighting: stop.weighting,
    submode: stop.submode,
    transportMode: stop.transportMode
  };

  if (userInput) {
    const { timeFrom, timeTo, dateFrom, dateTo, comment } = userInput;

    let validPeriod = {};

    if (timeFrom && dateFrom) {
      validPeriod.fromDate = helpers.getFullUTCString(timeFrom, dateFrom);
    }

    if (timeTo && dateTo) {
      validPeriod.toDate = helpers.getFullUTCString(timeTo, dateTo);
    }

    stopVariables.validBetween = validPeriod;

    stopVariables.versionComment = comment;
  }

  if (stop.location) {
    stopVariables.coordinates = [[stop.location[1], stop.location[0]]];
  }
  return stopVariables;
};

helpers.mapPathLinkToVariables = pathLinks => {
  return pathLinks.map(source => {
    let pathLink = JSON.parse(JSON.stringify(source));

    // TODO : Move these to stripRedundantFields, write test for this

    if (pathLink.from && pathLink.from.placeRef) {
      if (pathLink.from.placeRef.addressablePlace) {
        delete pathLink.from.placeRef.addressablePlace;
      }
    }

    if (pathLink.to && pathLink.to.placeRef) {
      if (pathLink.to.placeRef.addressablePlace) {
        delete pathLink.to.placeRef.addressablePlace;
      }
    }

    pathLink.transferDuration = {
      defaultDuration: source.estimate
    };

    if (pathLink.inBetween && pathLink.inBetween.length) {
      pathLink.geometry = {
        type: 'LineString',
        coordinates: pathLink.inBetween.map(latlng => latlng.reverse())
      };
    }
    return stripRedundantFields(pathLink);
  });
};

helpers.mapParkingToVariables = (parkingArr, parentRef) => {
  return parkingArr.map(source => {
    let parking = {
      totalCapacity: Number(source.totalCapacity) || 0,
      parentSiteRef: parentRef,
      parkingVehicleTypes: source.parkingVehicleTypes,
      validBetween: source.validBetween
    };

    if (source.id) {
      parking.id = source.id;
    }

    parking.name = {
      value: source.name,
      lang: 'nb'
    };

    if (source.location) {
      let coordinates = source.location
        .map(c => {
          if (!isFloat(c)) {
            return parseFloat(c + '.0000001');
          }
          return c;
        })
        .reverse();

      parking.geometry = {
        type: 'Point',
        coordinates: [coordinates]
      };
    } else {
      parking.geometry = null;
    }

    return parking;
  });
};

const stripRedundantFields = pathLink => {
  delete pathLink.estimate;
  delete pathLink.duration;
  delete pathLink.inBetween;

  if (pathLink.to && pathLink.to.addressablePlace) {
    delete pathLink.to.addressablePlace.geometry;
  }

  if (pathLink.from && pathLink.from.addressablePlace) {
    delete pathLink.from.addressablePlace.geometry;
  }

  return pathLink;
};

const formatAccessibilityAssements = assements => {
  if (assements && assements.limitations) {
    Object.keys(defaultLimitations).map(key => {
      if (!assements.limitations[key]) {
        assements.limitations[key] = 'UNKNOWN';
      }
    });
  }
  return assements;
};

const isFloat = n => Number(n) === n && n % 1 !== 0;

export default helpers;
