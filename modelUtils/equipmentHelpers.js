import { getIn } from '../utils';
import { defaultEquipments, types } from '../models/Equipments';

const EquipmentHelpers = {};

EquipmentHelpers.getTicketMachineState = entity => {
  return getIn(
    entity,
    ['placeEquipments', 'ticketingEquipment', 'ticketMachines'],
    false,
  );
};

EquipmentHelpers.getShelterEquipmentState = entity => {
  const equipmentState = getIn(
    entity,
    ['placeEquipments', 'shelterEquipment'],
    null,
  );
  return equipmentState !== null;
};

EquipmentHelpers.getSanitaryEquipmentState = entity => {
  const sanitaryState = getIn(
    entity,
    ['placeEquipments', 'sanitaryEquipment'],
    null,
  );
  return sanitaryState !== null;
};

EquipmentHelpers.get512SignEquipment = entity => {
  const generalSign = getIn(entity, ['placeEquipments', 'generalSign'], null);

  if (generalSign) {
    for (let i = 0; i < generalSign.length; i++) {
      let sign = generalSign[i];
      if (
        sign.privateCode &&
        sign.privateCode.value == '512' &&
        sign.signContentType === 'transportMode'
      ) {
        return true;
      }
    }
  }
  return false;
};

EquipmentHelpers.update512SignEquipment = (entity, payLoad) => {
  // this maps to signContentType, privateCode = 512 && signContentType = 'TransportModePoint'
  const props = {
    privateCode: { value: 512 },
    signContentType: 'transportMode',
  };
  const copyOfEntity = JSON.parse(JSON.stringify(entity));

  return updateEquipmentArray(copyOfEntity, payLoad, types.generalSign, props);
};

EquipmentHelpers.getWaitingRoomState = entity => {
  const waitingRoomState = getIn(
    entity,
    ['placeEquipments', 'waitingRoomEquipment'],
    null,
  );
  return waitingRoomState !== null;
};

EquipmentHelpers.getCycleStorageEquipment = entity => {
  const cycleStorageState = getIn(
    entity,
    ['placeEquipments', 'cycleStorageEquipment'],
    null,
  );
  return cycleStorageState !== null;
};

EquipmentHelpers.updateTicketMachineState = (stopPlace, payLoad) => {
  let updatedStop = JSON.parse(JSON.stringify(stopPlace));
  return updateEquipmentForEntitity(updatedStop, payLoad, types.ticketMachine);
};

EquipmentHelpers.updateShelterEquipmentState = (stopPlace, payLoad) => {
  let updatedStop = JSON.parse(JSON.stringify(stopPlace));
  return updateEquipmentForEntitity(
    updatedStop,
    payLoad,
    types.shelterEquipment,
  );
};

EquipmentHelpers.updateSanitaryEquipmentState = (stopPlace, payLoad) => {
  let updatedStop = JSON.parse(JSON.stringify(stopPlace));
  return updateEquipmentForEntitity(
    updatedStop,
    payLoad,
    types.sanitaryEquipment,
  );
};

EquipmentHelpers.updateWaitingRoomState = (stopPlace, payLoad) => {
  let updatedStop = JSON.parse(JSON.stringify(stopPlace));
  return updateEquipmentForEntitity(
    updatedStop,
    payLoad,
    types.waitingRoomEquipment,
  );
};

EquipmentHelpers.updateCycleStorageEquipmentState = (stopPlace, payLoad) => {
  let updatedStop = JSON.parse(JSON.stringify(stopPlace));
  return updateEquipmentForEntitity(
    updatedStop,
    payLoad,
    types.cycleStorageEquipment,
  );
};

const updateEquipmentArray = (entity, payLoad, typeOfEquipment, props) => {
  const { state, type, id } = payLoad;

  if (type === 'stopPlace') {
    return updateEquipmentForEntityArray(entity, state, typeOfEquipment, props);
  } else if (type === 'quay') {
    entity.quays[id] = updateEquipmentForEntityArray(
      entity.quays[id],
      state,
      typeOfEquipment,
      props,
    );
  }
  return entity;
};

const updateEquipmentForEntityArray = (
  entity,
  state,
  typeOfEquipment,
  props,
) => {
  if (!entity.placeEquipments) {
    entity.placeEquipments = {};
  }

  let equipmentToModify = entity.placeEquipments[typeOfEquipment];
  if (equipmentToModify) {
    if (state && props) {
      entity.placeEquipments[typeOfEquipment] = [
        ...entity.placeEquipments[typeOfEquipment],
        props,
      ];
    } else {
      entity.placeEquipments[typeOfEquipment] = entity.placeEquipments[
        typeOfEquipment
      ].filter(
        sign =>
          sign.privateCode &&
          sign.privateCode.value != props.privateCode &&
          sign.signContentType != props.signContentType,
      );
    }
  } else {
    if (props) {
      entity.placeEquipments[typeOfEquipment] = [props];
    }
  }
  return entity;
};

const updateEquipmentForEntitity = (entity, payLoad, typeOfEquipment) => {
  const { state, type, id } = payLoad;

  let stateFromCheckbox = typeof state === 'boolean';

  let overrideState = null;

  if (stateFromCheckbox) {
    if (state) {
      overrideState = defaultEquipments[typeOfEquipment].isChecked;
    } else {
      overrideState = defaultEquipments[typeOfEquipment].isUnChecked;
    }
  } else {
    overrideState = state;
  }

  if (type === 'stopPlace') {
    if (!entity.placeEquipments) {
      entity.placeEquipments = {};
    }

    entity.placeEquipments[typeOfEquipment] = overrideState;
  } else if (type === 'quay') {
    if (entity.quays && entity.quays[id]) {
      if (!entity.quays[id].placeEquipments) {
        entity.quays[id].placeEquipments = {};
      }
      entity.quays[id].placeEquipments[typeOfEquipment] = overrideState;
    }
  }
  return entity;
};

export default EquipmentHelpers;
