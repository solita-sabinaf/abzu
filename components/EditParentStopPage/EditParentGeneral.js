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


import React from 'react';
import { connect } from 'react-redux';
import { injectIntl } from 'react-intl';
import FlatButton from 'material-ui/FlatButton';
import ParentStopDetails from './ParentStopDetails';
import MdBack from 'material-ui/svg-icons/navigation/arrow-back';
import VersionsPopover from '../EditStopPage/VersionsPopover';
import MdUndo from 'material-ui/svg-icons/content/undo';
import MdSave from 'material-ui/svg-icons/content/save';
import ConfirmDialog from '../Dialogs/ConfirmDialog';
import { StopPlaceActions, UserActions } from '../../actions/';
import SaveDialog from '../Dialogs/SaveDialog';
import { withApollo } from 'react-apollo';
import mapToMutationVariables from '../../modelUtils/mapToQueryVariables';
import {
  saveParentStopPlace,
  getStopPlaceVersions,
  createParentStopPlace,
  addToMultiModalStopPlace,
  removeStopPlaceFromMultiModalStop,
  terminateStop,
  deleteStopPlace
} from '../../graphql/Actions';
import * as types from '../../actions/Types';
import { MutationErrorCodes } from '../../models/ErrorCodes';
import { stopPlaceAndPathLinkByVersion } from '../../graphql/Queries';
import RemoveStopFromParentDialog from '../Dialogs/RemoveStopFromParentDialog';
import TerminateStopPlaceDialog from '../Dialogs/TerminateStopPlaceDialog';
import { getIn, getIsCurrentVersionMax } from '../../utils/';

class EditParentGeneral extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      confirmUndoOpen: false,
      saveDialogOpen: false,
      errorMessage: '',
      confirmGoBack: false,
    };
  }

  getTitleText = (stopPlace, formatMessage) => {
    return stopPlace && stopPlace.id
      ? `${stopPlace.name}, ${stopPlace.parentTopographicPlace} (${stopPlace.id})`
      : formatMessage({ id: 'new_stop_title' });
  };

  handleLoadVersion({ id, version }) {
    const { client } = this.props;
    client.query({
      fetchPolicy: 'network-only',
      query: stopPlaceAndPathLinkByVersion,
      variables: {
        id,
        version
      }
    });
  }

  handleCloseRemoveStopFromParent() {
    this.props.dispatch(UserActions.hideRemoveStopPlaceFromParent());
  }

  handleTerminateStop(shouldHardDelete, comment, dateTime) {
    const { client, stopPlace, dispatch } = this.props;

    if (shouldHardDelete) {
      deleteStopPlace(client, stopPlace.id)
        .then(response => {
          dispatch(UserActions.hideDeleteStopDialog());
          if (response.data.deleteStopPlace) {
            dispatch(UserActions.navigateToMainAfterDelete());
          } else {
            UserActions.openSnackbar(types.SNACKBAR_MESSAGE_SAVED, types.ERROR);
          }
        })
        .catch(err => {
          dispatch(UserActions.hideDeleteStopDialog(true));
          dispatch(
            UserActions.openSnackbar(types.SNACKBAR_MESSAGE_SAVED, types.ERROR)
          );
        });
    } else {
      terminateStop(client, stopPlace.id, comment, dateTime).then( result => {
        this.handleSaveSuccess(stopPlace.id);
        this.handleCloseDeleteStop();
      })
    }
  }

  determineHowToSave(userInput) {
    const { stopPlace, client } = this.props;

    if (stopPlace.isNewStop) {
      const stopPlaceVariables = mapToMutationVariables.mapParentStopToVariables(stopPlace, userInput);
      this.handleCreateNewParentStopPlace(stopPlaceVariables);
    } else {
      const childrenToAdd = stopPlace.children.filter( child => child.notSaved).map( child => child.id);
      addToMultiModalStopPlace(client, stopPlace.id, childrenToAdd).then( response => {
        const stopPlaceVariables = mapToMutationVariables.mapParentStopToVariables(stopPlace, userInput);
        this.saveParentStop(stopPlaceVariables);
      });
    }
  }

  handleGoBack() {
    this.setState({
      confirmGoBack: false
    });
    this.props.dispatch(UserActions.navigateTo('/', ''));
  }

  handleAllowUserToGoBack() {
    if (this.props.stopHasBeenModified) {
      this.setState({
        confirmGoBack: true
      });
    } else {
      this.handleGoBack();
    }
  }

  handleCloseDeleteStop() {
    this.props.dispatch(UserActions.hideDeleteStopDialog());
  }

  handleRemoveStopFromParent() {
    const { removingStopPlaceFromParentId, client, stopPlace } = this.props;
    removeStopPlaceFromMultiModalStop(client, stopPlace.id, removingStopPlaceFromParentId).then( response => {
      this.handleSaveSuccess(stopPlace.id);
      this.handleCloseRemoveStopFromParent();
    }).catch( err => {
      this.handleSaveError(err);
      this.handleCloseRemoveStopFromParent();
    });
  }

  handleSaveSuccess(stopPlaceId) {
    const { client, dispatch } = this.props;

    this.setState({
      saveDialogOpen: false
    });

    getStopPlaceVersions(client, stopPlaceId).then(() => {
      dispatch(UserActions.navigateTo('/edit/', stopPlaceId));
      dispatch(
        UserActions.openSnackbar(types.SNACKBAR_MESSAGE_SAVED, types.SUCCESS)
      );
    });
  }

  handleSaveError(errorCode) {
    this.props.dispatch(
      UserActions.openSnackbar(types.SNACKBAR_MESSAGE_FAILED, types.ERROR)
    );
    this.setState({
      errorMessage: errorCode
    });
  }

  handleSave() {
    this.setState({
      saveDialogOpen: true,
      errorMessage: ''
    });
  }

  handleDiscardChanges() {
    this.setState({
      confirmUndoOpen: false
    });
    this.props.dispatch(StopPlaceActions.discardChangesForEditingStop());
  }

  handleCreateNewParentStopPlace(variables) {
    const { client} = this.props;

    createParentStopPlace(client, variables)
      .then(({ data }) => {
        if (
          data &&
          data.createMultiModalStopPlace
        ) {
          const parentStopPlaceId = data.createMultiModalStopPlace.id;
          this.handleSaveSuccess(parentStopPlaceId);
        }
      })
      .catch(err => {
        this.handleSaveError(MutationErrorCodes.ERROR_STOP_PLACE);
      });
  }

  saveParentStop(parentStopPlaceVariables) {
    const { client } = this.props;

    saveParentStopPlace(client, parentStopPlaceVariables)
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
      .catch(err => {
        this.handleSaveError(MutationErrorCodes.ERROR_STOP_PLACE);
      });
  }

  getIsAllowedToSave() {
    const { disabled, stopHasBeenModified, stopPlace } = this.props;
    if (!stopPlace) return false;
    if (disabled) return false;
    if (!stopPlace.name.length) return false;
    if (!stopPlace.id && !stopPlace.children.length){
      return false;
    }
    return stopHasBeenModified;
  }

  render() {

    const {
      stopPlace,
      versions,
      intl,
      stopHasBeenModified,
      disabled,
      removingStopPlaceFromParentId,
      removeStopPlaceFromParentOpen
    } = this.props;

    if (!stopPlace) return null;

    const { formatMessage } = intl;
    const isAllowedToSave = this.getIsAllowedToSave();
    const isCurrentVersionMax = getIsCurrentVersionMax(versions, stopPlace.version);

    const containerStyle = {
      border: '1px solid #511E12',
      background: '#fff',
      width: 405,
      marginTop: 1,
      position: 'absolute',
      zIndex: 999,
      marginLeft: 2,
      height: 'auto'
    };

    const stopBoxBar = {
      color: '#fff',
      background: 'rgb(39, 58, 70)',
      fontSize: 12,
      padding: 2,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    };

    const stopPlaceLabel = this.getTitleText(stopPlace, formatMessage);
    const disableTerminate = stopPlace.isNewStop || disabled || stopPlace.hasExpired;

    return (
      <div style={containerStyle}>
        <div style={stopBoxBar}>
          <div style={{ display: 'flex', alignItems: 'center', color: '#fff' }}>
            <MdBack
              color="#fff"
              style={{
                cursor: 'pointer',
                marginRight: 2,
                transform: 'scale(0.8)'
              }}
              onClick={() => this.handleAllowUserToGoBack()}
            />
            <div>{stopPlaceLabel}</div>
          </div>
          <VersionsPopover
            versions={versions || []}
            buttonLabel={formatMessage({ id: 'versions' })}
            disabled={!(versions||[]).length}
            handleSelect={this.handleLoadVersion.bind(this)}
          />
        </div>
        <ParentStopDetails
          handleCreateNewParentStopPlace={this.handleCreateNewParentStopPlace.bind(
            this
          )}
          disabled={disabled}
        />
        { isCurrentVersionMax &&
        <div
          style={{
            border: '1px solid #efeeef',
            textAlign: 'right',
            width: '100%',
            display: 'flex',
            justifyContent: 'space-around'
          }}
        >
          <FlatButton
            disabled={disableTerminate}
            label={formatMessage({ id: 'terminate_stop_place' })}
            style={{ margin: '8 5', zIndex: 999 }}
            labelStyle={{ fontSize: '0.7em', color: disableTerminate ? 'rgba(0, 0, 0, 0.3)' : 'initial'}}
            onClick={() => {
              this.props.dispatch(UserActions.requestTerminateStopPlace())
            }}
          />
          <FlatButton
            icon={<MdUndo style={{height: '1.3em', width: '1.3em'}} />}
            disabled={!stopHasBeenModified}
            label={formatMessage({ id: 'undo_changes' })}
            style={{ margin: '8 5', zIndex: 999 }}
            labelStyle={{ fontSize: '0.7em' }}
            onClick={() => {
              this.setState({ confirmUndoOpen: true });
            }}
          />
          <FlatButton
            icon={<MdSave style={{height: '1.3em', width: '1.3em'}}/>}
            disabled={!isAllowedToSave}
            label={formatMessage({ id: 'save_new_version' })}
            style={{ margin: '8 5', zIndex: 999 }}
            labelStyle={{ fontSize: '0.7em' }}
            onClick={this.handleSave.bind(this)}
          />
        </div>
        }
        <ConfirmDialog
          open={this.state.confirmUndoOpen}
          handleClose={() => {
            this.setState({ confirmUndoOpen: false });
          }}
          handleConfirm={() => {
            this.handleDiscardChanges();
          }}
          messagesById={{
            title: 'discard_changes_title',
            body: 'discard_changes_body',
            confirm: 'discard_changes_confirm',
            cancel: 'discard_changes_cancel'
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
        />
        <RemoveStopFromParentDialog
          open={removeStopPlaceFromParentOpen}
          handleClose={this.handleCloseRemoveStopFromParent.bind(this)}
          handleConfirm={this.handleRemoveStopFromParent.bind(this)}
          intl={intl}
          stopPlaceId={removingStopPlaceFromParentId}
        />
        <ConfirmDialog
          open={this.state.confirmGoBack}
          handleClose={() => {
            this.setState({confirmGoBack: false})
          }}
          handleConfirm={() => {
            this.handleGoBack();
          }}
          messagesById={{
            title: 'discard_changes_title',
            body: 'discard_changes_body',
            confirm: 'discard_changes_confirm',
            cancel: 'discard_changes_cancel'
          }}
          intl={intl}
        />
        {this.state.saveDialogOpen && !disabled
          ? <SaveDialog
              open={this.state.saveDialogOpen}
              handleClose={() => {
                this.setState({ saveDialogOpen: false });
              }}
              handleConfirm={this.determineHowToSave.bind(this)}
              errorMessage={this.state.errorMessage}
              intl={intl}
              currentValidBetween={stopPlace.validBetween}
            />
          : null}
      </div>
    );
  }
}

const mapStateToProps = ({ stopPlace, mapUtils, roles }) => ({
  stopPlace: stopPlace.current,
  versions: stopPlace.versions,
  stopHasBeenModified: stopPlace.stopHasBeenModified,
  removeStopPlaceFromParentOpen: mapUtils.removeStopPlaceFromParentOpen,
  removingStopPlaceFromParentId: mapUtils.removingStopPlaceFromParentId,
  canDeleteStop: getIn(roles, ['allowanceInfo', 'canDeleteStop'], false),
  deleteStopDialogOpen: mapUtils.deleteStopDialogOpen,
});

export default withApollo(
  injectIntl(connect(mapStateToProps)(EditParentGeneral))
);
