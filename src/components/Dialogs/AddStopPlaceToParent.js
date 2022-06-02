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

import React, { Component } from "react";
import { injectIntl } from "react-intl";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { getChildStopPlaceSuggestions } from "../../modelUtils/leafletUtils";
import AddStopPlaceSuggestionList from "./AddStopPlaceSuggestionList";
import {
  Box,
  Button,
  ButtonGroup,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";

class AddStopPlaceToParent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      checkedItems: [],
    };
  }

  handleOnItemCheck(id, value) {
    const { checkedItems } = this.state;
    let newCheckedItems = checkedItems.slice();

    if (value) {
      newCheckedItems = checkedItems.concat(id);
    } else {
      newCheckedItems = newCheckedItems.filter((item) => item !== id);
    }

    this.setState({
      checkedItems: newCheckedItems,
    });
  }

  render() {
    const {
      open,
      handleClose,
      handleConfirm,
      intl,
      neighbourStops,
      stopPlaceCentroid,
      stopPlaceChildren,
      roleAssignments,
      fetchedPolygons,
      allowNewStopEverywhere,
    } = this.props;

    const { formatMessage } = intl;
    const { checkedItems } = this.state;

    let canSave = !!checkedItems.length;

    const suggestions = getChildStopPlaceSuggestions(
      stopPlaceChildren,
      stopPlaceCentroid,
      neighbourStops,
      roleAssignments,
      10,
      fetchedPolygons,
      allowNewStopEverywhere
    );

    return (
      <Dialog open={open} fullWidth>
        <DialogTitle>{formatMessage({ id: "add_stop_place" })}</DialogTitle>
        <DialogContent>
          <Box
            noValidate
            component="form"
            sx={{
              display: "flex",
              flexDirection: "column",
              m: "auto",
              width: "fit-content",
            }}
          >
            <AddStopPlaceSuggestionList
              suggestions={suggestions}
              checkedItems={checkedItems}
              formatMessage={formatMessage}
              onItemCheck={this.handleOnItemCheck.bind(this)}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <ButtonGroup>
            <Button variant="text" onClick={handleClose} color="secondary">
              {formatMessage({ id: "change_coordinates_cancel" })}
            </Button>
            <Button
              variant="text"
              keyboardFocused={true}
              disabled={!canSave}
              onClick={() => handleConfirm(checkedItems)}
            >
              {formatMessage({ id: "add" })}
            </Button>
          </ButtonGroup>
        </DialogActions>
      </Dialog>
    );
  }
}

AddStopPlaceToParent.propTypes = {
  open: PropTypes.bool.isRequired,
  handleClose: PropTypes.func.isRequired,
  handleConfirm: PropTypes.func.isRequired,
};

const mapStateToProps = ({ stopPlace, roles }) => ({
  neighbourStops: stopPlace.neighbourStops,
  stopPlaceCentroid: stopPlace.current.location,
  stopPlaceChildren: stopPlace.current.children,
  stopHasBeenModified: stopPlace.stopHasBeenModified,
  roleAssignments: roles.auth.roleAssignments,
  fetchedPolygons: roles.fetchedPolygons,
  allowNewStopEverywhere: roles.allowNewStopEverywhere,
});

export default connect(mapStateToProps)(injectIntl(AddStopPlaceToParent));
