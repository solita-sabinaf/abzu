import React, { PropTypes } from 'react'
import Dialog from 'material-ui/Dialog'
import FlatButton from 'material-ui/FlatButton'
import TextField from 'material-ui/TextField'

class CoordinatesDialog extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      errorText: ''
    }
  }

  static propTypes = {
    open: PropTypes.bool.isRequired,
    intl: PropTypes.object.isRequired,
    coordinates: PropTypes.string,
    handleConfirm: PropTypes.func.isRequired
  }

  handleInputChange(event, newValue) {
    this.setState({
      coordinates: newValue
    })
  }

  handleClose() {
    this.setState({
      coordinates: null,
      errorText: ''
    })
    this.props.handleClose()
  }

  handleConfirm() {

    const coordinatesString = this.state ? this.state.coordinates : this.props.coordinates

    if (typeof coordinatesString === 'undefined') return

    const position = coordinatesString && coordinatesString.split(',')

    if (position && position.length == 2 && !isNaN(position[0]) && !isNaN(position[1])) {

      const latLng = {
        lat: Number(position[0]),
        lng: Number(position[1])
      }
      this.props.handleConfirm(latLng)

      this.setState({
        coordinates: null,
        errorText: ''
      })

    } else {
      this.setState({
        errorText: this.props.intl.formatMessage({id: 'change_coordinates_invalid'})
      })
    }
  }


  render() {

    const { open, intl } = this.props
    const { formatMessage } = intl
    const coordinates = this.state.coordinates || this.props.coordinates

    const confirmDialogTranslation = {
      title: formatMessage({id: 'change_coordinates'}),
      body: formatMessage({id: 'change_coordinates_help_text'}),
      confirm: formatMessage({id: 'change_coordinates_confirm'}),
      cancel: formatMessage({id: 'change_coordinates_cancel'})
    }

    const buttonWrapperStyle = {
      display: 'flex',
      justifyContent: 'flex-end',
      alignItems: 'center',
      marginTop: 20
    }

    const actions = [
      <TextField
        hintText="lat,lng"
        floatingLabelText={formatMessage({id: 'coordinates'})}
        style={{display: 'block', margin: 'auto', width: '90%'}}
        value={coordinates}
        onChange={this.handleInputChange.bind(this)}
        errorText={this.state.errorText}
      />,
      <div style={buttonWrapperStyle}>
        <FlatButton
          label={'Avbryt'}
          primary={true}
          keyboardFocused={true}
          onTouchTap={() => this.handleClose()}
          style={{marginRight: 5}}
        />
        <FlatButton
          label={'Endre koordinater'}
          primary={true}
          keyboardFocused={true}
          onTouchTap={() => this.handleConfirm()}
        />
      </div>
    ]

    return (
      <div>
        <Dialog
          title={confirmDialogTranslation.title}
          actions={actions}
          modal={false}
          open={open}
          contentStyle={{width: '45vw'}}
        >
          { confirmDialogTranslation.body }
        </Dialog>
      </div>
    )
  }
}

export default CoordinatesDialog