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

import { defaultEquipments, types } from "../models/Equipments";
import { getIn } from "../utils";

const EquipmentHelpers = {};

EquipmentHelpers.isTicketMachinePresent = (entity) => {
  return !!getIn(
    entity,
    ["placeEquipments", "ticketingEquipment", "ticketMachines"],
    null,
  );
};

EquipmentHelpers.isShelterEquipmentPresent = (entity) => {
  return !!getIn(
    entity,
    ["placeEquipments", "shelterEquipment", "seats"],
    null,
  );
};

EquipmentHelpers.isSanitaryEquipmentPresent = (entity) => {
  return !!getIn(
    entity,
    ["placeEquipments", "sanitaryEquipment", "numberOfToilets"],
    null,
  );
};

EquipmentHelpers.is512SignEquipmentPresent = (entity) => {
  const generalSign = getIn(entity, ["placeEquipments", "generalSign"], null);
  if (
    generalSign &&
    generalSign.privateCode &&
    `${generalSign.privateCode.value}` === "512" &&
    generalSign.signContentType === "transportMode"
  ) {
    return true;
  }
  return false;
};

EquipmentHelpers.update512SignEquipment = (entity, payload) => {
  const copyOfEntity = JSON.parse(JSON.stringify(entity));
  return updateEquipmentForEntitity(copyOfEntity, payload, types.generalSign);
};

EquipmentHelpers.isWaitingRoomPresent = (entity) => {
  return !!getIn(
    entity,
    ["placeEquipments", "waitingRoomEquipment", "seats"],
    null,
  );
};

EquipmentHelpers.isCycleStorageEquipmentPresent = (entity) => {
  return !!getIn(
    entity,
    ["placeEquipments", "cycleStorageEquipment", "numberOfSpaces"],
    null,
  );
};

EquipmentHelpers.updateTicketMachineState = (stopPlace, payload) => {
  let updatedStop = JSON.parse(JSON.stringify(stopPlace));
  return updateEquipmentForEntitity(updatedStop, payload, types.ticketMachine);
};

EquipmentHelpers.updateShelterEquipmentState = (stopPlace, payload) => {
  let updatedStop = JSON.parse(JSON.stringify(stopPlace));
  return updateEquipmentForEntitity(
    updatedStop,
    payload,
    types.shelterEquipment,
  );
};

EquipmentHelpers.updateSanitaryEquipmentState = (stopPlace, payload) => {
  let updatedStop = JSON.parse(JSON.stringify(stopPlace));
  return updateEquipmentForEntitity(
    updatedStop,
    payload,
    types.sanitaryEquipment,
  );
};

EquipmentHelpers.updateWaitingRoomState = (stopPlace, payload) => {
  let updatedStop = JSON.parse(JSON.stringify(stopPlace));
  return updateEquipmentForEntitity(
    updatedStop,
    payload,
    types.waitingRoomEquipment,
  );
};

EquipmentHelpers.updateCycleStorageEquipmentState = (stopPlace, payload) => {
  let updatedStop = JSON.parse(JSON.stringify(stopPlace));
  return updateEquipmentForEntitity(
    updatedStop,
    payload,
    types.cycleStorageEquipment,
  );
};

const updateEquipmentForEntitity = (entity, payload, typeOfEquipment) => {
  const { state, type, id } = payload;

  let stateFromCheckbox = typeof state === "boolean";

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

  if (type === "stopPlace") {
    if (!entity.placeEquipments) {
      entity.placeEquipments = {};
    }

    entity.placeEquipments[typeOfEquipment] = overrideState;
  } else if (type === "quay") {
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
