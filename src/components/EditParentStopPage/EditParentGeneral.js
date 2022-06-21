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

import React from "react";
import { connect } from "react-redux";
import { injectIntl } from "react-intl";
import FlatButton from "material-ui/FlatButton";
import ParentStopDetails from "./ParentStopDetails";
import MdBack from "material-ui/svg-icons/navigation/arrow-back";
import VersionsPopover from "../EditStopPage/VersionsPopover";
import MdUndo from "material-ui/svg-icons/content/undo";
import MdSave from "material-ui/svg-icons/content/save";
import ConfirmDialog from "../Dialogs/ConfirmDialog";
import { StopPlaceActions, UserActions } from "../../actions/";
import SaveDialog from "../Dialogs/SaveDialog";
import AddAdjacentStopsDialog from "../Dialogs/AddAdjacentStopsDialog";
import mapToMutationVariables from "../../modelUtils/mapToQueryVariables";
import * as types from "../../actions/Types";
import { MutationErrorCodes } from "../../models/ErrorCodes";
import RemoveStopFromParentDialog from "../Dialogs/RemoveStopFromParentDialog";
import TerminateStopPlaceDialog from "../Dialogs/TerminateStopPlaceDialog";
import { getIn, getIsCurrentVersionMax } from "../../utils/";
import {
  addToMultiModalStopPlace,
  createParentStopPlace,
  getNeighbourStops,
  getStopPlaceAndPathLinkByVersion,
  getStopPlaceVersions,
  removeStopPlaceFromMultiModalStop,
  saveParentStopPlace,
} from "../../actions/TiamatActions";
import Routes from "../../routes";
import SettingsManager from "../../singletons/SettingsManager";

class EditParentGeneral extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      confirmUndoOpen: false,
      saveDialogOpen: false,
      errorMessage: "",
      confirmGoBack: false,
      isRemovingStopLoading: false,
    };
  }

  getTitleText = (stopPlace, originalStopPlace, formatMessage) => {
    return stopPlace && stopPlace.id
      ? `${originalStopPlace.name}, ${stopPlace.parentTopographicPlace} (${stopPlace.id})`
      : formatMessage({ id: "new_stop_title" });
  };

  handleLoadVersion({ id, version }) {
    this.props.dispatch(getStopPlaceAndPathLinkByVersion(id, version));
  }

  handleCloseRemoveStopFromParent() {
    this.props.dispatch(UserActions.hideRemoveStopPlaceFromParent());
  }

  handleCloseAddAdjacentStop() {
    this.props.dispatch(UserActions.hideAddAdjacentStopDialog());
  }

  handleTerminateStop(
    shouldHardDelete,
    shouldTerminatePermanently,
    comment,
    dateTime
  ) {
    const { stopPlace, dispatch } = this.props;
    this.setState({ isLoading: true });
    if (shouldHardDelete) {
      dispatch(deleteStopPlace(stopPlace.id))
        .then((response) => {
          this.setState({ isLoading: false });
          dispatch(UserActions.hideDeleteStopDialog());
          if (response.data.deleteStopPlace) {
            dispatch(UserActions.navigateToMainAfterDelete());
          }
        })
        .catch((err) => {
          this.setState({ isLoading: false });
          dispatch(UserActions.hideDeleteStopDialog(true));
        });
    } else {
      dispatch(
        terminateStop(
          stopPlace.id,
          shouldTerminatePermanently,
          comment,
          dateTime
        )
      )
        .then((result) => {
          this.handleSaveSuccess(stopPlace.id);
          this.handleCloseDeleteStop();
          this.setState({ isLoading: false });
        })
        .catch((err) => {
          this.setState({ isLoading: false });
        });
    }
  }

  determineHowToSave(userInput) {
    const { stopPlace, dispatch } = this.props;

    if (stopPlace.isNewStop) {
      const stopPlaceVariables =
        mapToMutationVariables.mapParentStopToVariables(stopPlace, userInput);
      this.handleCreateNewParentStopPlace(stopPlaceVariables);
    } else {
      const childrenToAdd = stopPlace.children
        .filter((child) => child.notSaved)
        .map((child) => child.id);

      const stopPlaceVariables =
        mapToMutationVariables.mapParentStopToVariables(stopPlace, userInput);

      if (childrenToAdd.length) {
        dispatch(addToMultiModalStopPlace(stopPlace.id, childrenToAdd)).then(
          (response) => {
            this.saveParentStop(stopPlaceVariables);
          }
        );
      } else {
        this.saveParentStop(stopPlaceVariables);
      }
    }
  }

  handleGoBack() {
    this.setState({
      confirmGoBack: false,
    });
    this.props.dispatch(UserActions.navigateTo("/", ""));
  }

  handleAllowUserToGoBack() {
    if (this.props.stopHasBeenModified) {
      this.setState({
        confirmGoBack: true,
      });
    } else {
      this.handleGoBack();
    }
  }

  handleCloseDeleteStop() {
    this.props.dispatch(UserActions.hideDeleteStopDialog());
  }

  handleRemoveStopFromParent() {
    const { removingStopPlaceFromParentId, dispatch, stopPlace } = this.props;
    this.setState({
      isLoading: true,
    });

    dispatch(
      removeStopPlaceFromMultiModalStop(
        stopPlace.id,
        removingStopPlaceFromParentId
      )
    )
      .then((response) => {
        this.handleSaveSuccess(stopPlace.id);
        this.handleCloseRemoveStopFromParent();
        this.setState({
          isLoading: false,
        });
      })
      .catch((err) => {
        this.handleSaveError(err);
        this.handleCloseRemoveStopFromParent();
        this.setState({
          isLoading: false,
        });
      });
  }

  async handleSaveSuccess(stopPlaceId) {
    const { dispatch, activeMap } = this.props;

    this.setState({
      saveDialogOpen: false,
    });

    await dispatch(getStopPlaceVersions(stopPlaceId));
    await dispatch(getNeighbourStops(
      stopPlaceId,
      activeMap.getBounds(),
      new SettingsManager().getShowExpiredStops()
    ));

    dispatch(UserActions.openSnackbar(types.SUCCESS));
  }

  handleSaveError(errorCode) {
    this.setState({
      errorMessage: errorCode,
    });
  }

  handleSave() {
    this.setState({
      saveDialogOpen: true,
      errorMessage: "",
    });
  }

  handleDiscardChanges() {
    this.setState({
      confirmUndoOpen: false,
    });
    this.props.dispatch(StopPlaceActions.discardChangesForEditingStop());
  }

  handleCreateNewParentStopPlace(variables) {
    const { dispatch } = this.props;

    dispatch(createParentStopPlace(variables))
      .then(({ data }) => {
        if (data && data.createMultiModalStopPlace) {
          const parentStopPlaceId = data.createMultiModalStopPlace.id;
          this.handleSaveSuccess(parentStopPlaceId);
        }
      })
      .catch((err) => {
        this.handleSaveError(MutationErrorCodes.ERROR_STOP_PLACE);
      });
  }

  saveParentStop(parentStopPlaceVariables) {
    const { dispatch } = this.props;

    dispatch(saveParentStopPlace(parentStopPlaceVariables))
      .then(({ data }) => {
        if (
          data &&
          data.mutateParentStopPlace &&
          data.mutateParentStopPlace.length
        ) {
          const parentStopPlaceId = data.mutateParentStopPlace[0].id;
          this.handleSaveSuccess(parentStopPlaceId);
        }
      })
      .catch((err) => {
        this.handleSaveError(MutationErrorCodes.ERROR_STOP_PLACE);
      });
  }

  getIsLastChild(children = []) {
    const childrenLeft = children.filter((child) => !child.notSaved);
    return childrenLeft.length === 1;
  }

  getIsAllowedToSave() {
    const { disabled, stopHasBeenModified, stopPlace } = this.props;
    if (!stopPlace) return false;
    if (disabled) return false;
    if (!stopPlace.name || !stopPlace.name.length) return false;
    if (!stopPlace.id && !stopPlace.children.length) {
      return false;
    }
    return stopHasBeenModified;
  }

  addAdjacentStopReference(stopPlaceId1, stopPlaceId2) {
    this.props.dispatch(
      StopPlaceActions.addAdjacentConnection(stopPlaceId1, stopPlaceId2)
    );
    this.handleCloseAddAdjacentStop();
  }

  render() {
    const {
      stopPlace,
      versions,
      intl,
      stopHasBeenModified,
      disabled,
      removingStopPlaceFromParentId,
      removeStopPlaceFromParentOpen,
      originalStopPlace,
      adjacentStopDialogOpen,
    } = this.props;

    if (!stopPlace) return null;

    const { formatMessage } = intl;
    const isAllowedToSave = this.getIsAllowedToSave();
    const isCurrentVersionMax = getIsCurrentVersionMax(
      versions,
      stopPlace.version
    );
    const isLastChild = this.getIsLastChild(stopPlace.children);

    const containerStyle = {
      border: "1px solid #511E12",
      background: "#fff",
      width: 405,
      marginTop: 1,
      position: "absolute",
      zIndex: 999,
      marginLeft: 2,
      height: "auto",
    };

    const stopBoxBar = {
      color: "#fff",
      background: "rgb(39, 58, 70)",
      fontSize: 12,
      padding: 2,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
    };

    const stopPlaceLabel = this.getTitleText(
      stopPlace,
      originalStopPlace,
      formatMessage
    );
    const disableTerminate =
      stopPlace.isNewStop || disabled || stopPlace.hasExpired;

    return (
      <div style={containerStyle}>
        <div style={stopBoxBar}>
          <div style={{ display: "flex", alignItems: "center", color: "#fff" }}>
            <MdBack
              color="#fff"
              style={{
                cursor: "pointer",
                marginRight: 2,
                transform: "scale(0.8)",
              }}
              onClick={() => this.handleAllowUserToGoBack()}
            />
            <div>{stopPlaceLabel}</div>
          </div>
          <VersionsPopover
            versions={versions || []}
            buttonLabel={formatMessage({ id: "versions" })}
            disabled={!(versions || []).length}
            handleSelect={this.handleLoadVersion.bind(this)}
          />
        </div>
        <ParentStopDetails
          handleCreateNewParentStopPlace={this.handleCreateNewParentStopPlace.bind(
            this
          )}
          disabled={disabled}
        />
        {isCurrentVersionMax && (
          <div
            style={{
              border: "1px solid #efeeef",
              textAlign: "right",
              width: "100%",
              display: "flex",
              justifyContent: "space-around",
            }}
          >
            <FlatButton
              disabled={disableTerminate}
              label={formatMessage({ id: "terminate_stop_place" })}
              style={{ margin: "8 5", zIndex: 999 }}
              labelStyle={{
                fontSize: "0.7em",
                color: disableTerminate ? "rgba(0, 0, 0, 0.3)" : "initial",
              }}
              onClick={() => {
                this.props.dispatch(
                  UserActions.requestTerminateStopPlace(stopPlace.id)
                );
              }}
            />
            <FlatButton
              icon={<MdUndo style={{ height: "1.3em", width: "1.3em" }} />}
              disabled={!stopHasBeenModified}
              label={formatMessage({ id: "undo_changes" })}
              style={{ margin: "8 5", zIndex: 999 }}
              labelStyle={{ fontSize: "0.7em" }}
              onClick={() => {
                this.setState({ confirmUndoOpen: true });
              }}
            />
            <FlatButton
              icon={<MdSave style={{ height: "1.3em", width: "1.3em" }} />}
              disabled={!isAllowedToSave}
              label={formatMessage({ id: "save_new_version" })}
              style={{ margin: "8 5", zIndex: 999 }}
              labelStyle={{ fontSize: "0.7em" }}
              onClick={this.handleSave.bind(this)}
            />
          </div>
        )}
        <ConfirmDialog
          open={this.state.confirmUndoOpen}
          handleClose={() => {
            this.setState({ confirmUndoOpen: false });
          }}
          handleConfirm={() => {
            this.handleDiscardChanges();
          }}
          messagesById={{
            title: "discard_changes_title",
            body: "discard_changes_body",
            confirm: "discard_changes_confirm",
            cancel: "discard_changes_cancel",
          }}
          intl={intl}
        />
        <TerminateStopPlaceDialog
          open={this.props.deleteStopDialogOpen}
          handleClose={this.handleCloseDeleteStop.bind(this)}
          handleConfirm={this.handleTerminateStop.bind(this)}
          intl={intl}
          previousValidBetween={stopPlace.validBetween}
          stopPlace={stopPlace}
          canDeleteStop={this.props.canDeleteStop}
          isLoading={this.state.isLoading}
          serverTimeDiff={this.props.serverTimeDiff}
          warningInfo={this.props.deleteStopDialogWarning}
        />
        {removeStopPlaceFromParentOpen && (
          <RemoveStopFromParentDialog
            open={removeStopPlaceFromParentOpen}
            handleClose={this.handleCloseRemoveStopFromParent.bind(this)}
            handleConfirm={this.handleRemoveStopFromParent.bind(this)}
            intl={intl}
            stopPlaceId={removingStopPlaceFromParentId}
            isLastChild={isLastChild}
            isLoading={this.state.isLoading}
          />
        )}
        <AddAdjacentStopsDialog
          open={adjacentStopDialogOpen}
          handleClose={this.handleCloseAddAdjacentStop.bind(this)}
          handleConfirm={this.addAdjacentStopReference.bind(this)}
        />

        <ConfirmDialog
          open={this.state.confirmGoBack}
          handleClose={() => {
            this.setState({ confirmGoBack: false });
          }}
          handleConfirm={() => {
            this.handleGoBack();
          }}
          messagesById={{
            title: "discard_changes_title",
            body: "discard_changes_body",
            confirm: "discard_changes_confirm",
            cancel: "discard_changes_cancel",
          }}
          intl={intl}
        />
        {this.state.saveDialogOpen && !disabled ? (
          <SaveDialog
            open={this.state.saveDialogOpen}
            handleClose={() => {
              this.setState({ saveDialogOpen: false });
            }}
            handleConfirm={this.determineHowToSave.bind(this)}
            errorMessage={this.state.errorMessage}
            intl={intl}
            currentValidBetween={stopPlace.validBetween}
            serverTimeDiff={this.props.serverTimeDiff}
          />
        ) : null}
      </div>
    );
  }
}

const mapStateToProps = ({ stopPlace, mapUtils, roles, user }) => ({
  stopPlace: stopPlace.current,
  versions: stopPlace.versions,
  activeMap: mapUtils.activeMap,
  stopHasBeenModified: stopPlace.stopHasBeenModified,
  removeStopPlaceFromParentOpen: mapUtils.removeStopPlaceFromParentOpen,
  removingStopPlaceFromParentId: mapUtils.removingStopPlaceFromParentId,
  adjacentStopDialogOpen: user.adjacentStopDialogOpen,
  canDeleteStop: getIn(roles, ["allowanceInfo", "canDeleteStop"], false),
  deleteStopDialogOpen: mapUtils.deleteStopDialogOpen,
  originalStopPlace: stopPlace.originalCurrent,
  serverTimeDiff: user.serverTimeDiff,
  deleteStopDialogWarning: user.deleteStopDialogWarning,
});

export default injectIntl(connect(mapStateToProps)(EditParentGeneral));
