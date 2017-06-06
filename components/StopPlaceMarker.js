import React, { PropTypes } from 'react';
import { Marker, Popup } from 'react-leaflet';
import L, { divIcon } from 'leaflet';
import ReactDOM from 'react-dom/server';
import CustomMarkerIcon from './CustomMarkerIcon';

class StopPlaceMarker extends React.Component {
  static propTypes = {
    position: PropTypes.arrayOf(Number),
    handleDragEnd: PropTypes.func.isRequired,
    handleOnClick: PropTypes.func.isRequired,
    handleChangeCoordinates: PropTypes.func,
    name: PropTypes.string.isRequired,
    stopType: PropTypes.string,
    index: PropTypes.number.isRequired,
    draggable: PropTypes.bool.isRequired,
    translations: PropTypes.object.isRequired,
    active: PropTypes.bool.isRequired,
    id: PropTypes.string,
    isEditingStop: PropTypes.bool.isRequired,
  };

  shouldComponentUpdate(nextProps, nextState) {
    if (
      JSON.stringify(this.props.position) !== JSON.stringify(nextProps.position)
    ) {
      return true;
    }

    if (this.props.draggable !== nextProps.draggable) {
      return true;
    }

    if (this.props.active !== nextProps.active) {
      return true;
    }

    if (this.props.stopType !== nextProps.stopType) {
      return true;
    }

    if (this.props.id !== nextProps.id) {
      return true;
    }

    if (this.props.isShowingQuays !== nextProps.isShowingQuays) {
      return true;
    }

    if (this.props.name !== nextProps.name) {
      return true;
    }

    return false;
  }

  componentWillMount() {
    const { index, stopType, active } = this.props;
    this.createIcon(index, stopType, active);
  }

  componentWillUpdate(nextProps, nextState) {
    const { index, stopType, active } = nextProps;
    this.createIcon(index, stopType, active);
  }

  createIcon(index, stopType, active) {
    let divIconBody = (
      <CustomMarkerIcon
        markerIndex={index}
        stopType={stopType}
        active={active}
      />
    );

    let divIconBodyMarkup = ReactDOM.renderToStaticMarkup(divIconBody);

    this._icon = divIcon({
      html: divIconBodyMarkup,
      iconAnchor: [10, 20],
      iconSize: [20, 20],
      popupAnchor: [0, 17],
    });
  }

  render() {
    const {
      position,
      handleOnClick,
      handleDragEnd,
      index,
      draggable,
      missingCoordinatesMap,
      handleChangeCoordinates,
      translations,
      id,
    } = this.props;

    const markerLocation = position || missingCoordinatesMap[id];

    if (!markerLocation) return null;

    const name = this.props.name ? this.props.name : translations.untitled;

    const icon = this._icon;

    return (
      <Marker
        key={'stop-place' + id}
        keyboard={false}
        icon={icon}
        position={markerLocation}
        onDragend={event => {
          handleDragEnd(false, index, event);
        }}
        draggable={draggable}
      >
        <Popup autoPan={false}>
          <div>
            <div
              style={{
                fontWeight: 600,
                color: '#41c0c4',
                fontSize: '1.2em',
                cursor: 'pointer',
                marginBottom: 10,
                display: 'inline-block',
                width: '100%',
                marginBottom: 15,
                textAlign: 'center',
              }}
              onClick={handleOnClick}
            >
              <div style={{ display: 'inline-block' }}>{name}</div>
            </div>
            <div
              style={{
                display: 'block',
                cursor: 'pointer',
                width: 'auto',
                textAlign: 'center',
              }}
              onClick={() =>
                handleChangeCoordinates &&
                handleChangeCoordinates(false, index, markerLocation)}
            >
              <span
                style={{
                  display: 'inline-block',
                  textAlign: 'center',
                  borderBottom: '1px dotted black',
                }}
              >
                {markerLocation[0]}
              </span>
              <span
                style={{
                  display: 'inline-block',
                  marginLeft: 3,
                  borderBottom: '1px dotted black',
                }}
              >
                {markerLocation[1]}
              </span>
            </div>
          </div>
        </Popup>
      </Marker>
    );
  }
}

export default StopPlaceMarker;
