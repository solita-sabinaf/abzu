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

import { Cancel, Save } from "@mui/icons-material";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from "@mui/material";
import PropTypes from "prop-types";
import React from "react";
import MdSpinner from "../../static/icons/spinner";

class SaveDialog extends React.Component {
  constructor(props) {
    super(props);
    this.state = this.getInitialState();
  }

  componentWillUnmount() {
    this.setState(this.getInitialState);
  }

  componentDidMount() {
    if (this.commentInput) {
      this.commentInput.focus();
    }
  }

  static propTypes = {
    open: PropTypes.bool.isRequired,
    handleClose: PropTypes.func.isRequired,
    handleConfirm: PropTypes.func.isRequired,
    intl: PropTypes.object.isRequired,
  };

  getInitialState() {
    return {
      isSaving: false,
      comment: "",
    };
  }

  getErrorMessage() {
    const { errorMessage, intl } = this.props;
    const { formatMessage } = intl;
    if (errorMessage) {
      return formatMessage({ id: `humanReadableErrorCodes.${errorMessage}` });
    }
    return "";
  }

  handleSave() {
    const { handleConfirm } = this.props;

    let userInput = {
      comment: this.comment,
    };

    this.setState({
      isSaving: true,
    });

    handleConfirm(userInput);
  }

  render() {
    const { open, intl, handleClose, errorMessage } = this.props;
    const { formatMessage } = intl;
    const { isSaving } = this.state;

    const errorMessageLabel = this.getErrorMessage()
      ? formatMessage({ id: this.getErrorMessage() })
      : "";

    const translations = {
      use: formatMessage({ id: "use" }),
      confirm: formatMessage({ id: "confirm" }),
      cancel: formatMessage({ id: "cancel" }),
      title: formatMessage({ id: "save_dialog_title" }),
      message_to: formatMessage({ id: "save_dialog_message_to" }),
      note: formatMessage({ id: "save_dialog_note" }),
      error: formatMessage({ id: "save_dialog_to_is_before_from" }),
      comment: formatMessage({ id: "comment" }),
    };

    return (
      <Dialog
        open={open}
        onClose={() => {
          handleClose();
        }}
      >
        <DialogTitle>{translations.title}</DialogTitle>
        <DialogContent>
          <div style={{ width: "90%", margin: "auto", marginBottom: 20 }}>
            <TextField
              label={translations.comment}
              variant="standard"
              ref={(input) => {
                this.commentInput = input;
              }}
              fullWidth={true}
              multiline={true}
              value={this.comment}
              onChange={(event) =>
                this.setState({ comment: event.target.value })
              }
              rowsMax={4}
            />
          </div>
          <div style={{ color: "#bb271c" }}>{errorMessageLabel}</div>
        </DialogContent>
        <DialogActions>
          <Button
            variant="text"
            onClick={handleClose}
            startIcon={<Cancel />}
            color="secondary"
          >
            {translations.cancel}
          </Button>
          <Button
            variant="text"
            startIcon={
              isSaving && !errorMessage.length ? <MdSpinner /> : <Save />
            }
            disabled={isSaving}
            onClick={() => this.handleSave()}
          >
            {translations.confirm}
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

export default SaveDialog;
