import { connect } from 'react-redux'
import React, { Component, PropTypes } from 'react'
import AutoComplete from 'material-ui/AutoComplete'
import IconButton from 'material-ui/IconButton'
import RaisedButton from 'material-ui/RaisedButton'
import ContentAdd from 'material-ui/svg-icons/content/add'
import { MapActions, AjaxActions, UserActions } from '../actions/'
import SearchBoxDetails from '../components/SearchBoxDetails'
import cfgreader from '../config/readConfig'
import NewStopPlace from '../components/NewStopPlace'
import { injectIntl } from 'react-intl'
import MenuItem from 'material-ui/MenuItem'
import ModalityIcon from '../components/ModalityIcon'
import SearchIcon from 'material-ui/svg-icons/action/search'
import FavoriteManager from '../singletons/FavoriteManager'
import CoordinatesDialog from '../components/CoordinatesDialog'
import SearchFilter from '../components/SearchFilter'

class SearchBox extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      showFilter: false,
      coordinatesDialogOpen: false
    }
  }

  componentDidMount() {
    cfgreader.readConfig( (function(config) {
      window.config = config
    }).bind(this))
  }

  handleEdit(id) {
    this.props.dispatch(UserActions.navigateTo('/edit/', id ))
  }

  handleUpdateInput(input) {
    if (!input || !input.length) {
      this.props.dispatch(UserActions.clearSearchResults())
      /* This is a work-around to solve bug in Material-UI causing handleUpdateInput to
       be fired upon handleNewRequest
       */
    } else if (input.indexOf('(') > -1 && input.indexOf(')') > -1) {
      return
    }
    else {
      this.props.dispatch(UserActions.setSearchText(input))
      this.props.dispatch(AjaxActions.getStopNames(input))
    }
  }

  handleNewRequest(result) {
    if (typeof(result.markerProps) !== 'undefined') {
      this.props.dispatch( MapActions.setActiveMarkers(result) )
    }
  }

  handleChangeCoordinates() {
    this.setState({
      coordinatesDialogOpen: true
    })
   }

  handleSubmitCoordinates(position) {
    this.props.dispatch( MapActions.changeMapCenter(position, 11))
    this.props.dispatch( UserActions.setMissingCoordinates(  position, this.props.activeMarker.markerProps.id ))

    this.setState(({
      coordinatesDialogOpen: false
    }))
  }

  handleNewStop() {
    this.props.dispatch(UserActions.toggleIsCreatingNewStop())
  }

  handleClearSearch() {
    this.refs.searchText.setState({
      searchText: ''
    })
    this.props.dispatch(UserActions.setSearchText(''))
  }

  handleToggleFilter(showFilter) {
    this.setState({
      showFilter: showFilter
    })
  }

  render() {

    const { activeMarker, isCreatingNewStop, favorited, missingCoordinatesMap, intl } = this.props
    const {  dataSource = [] } = this.props
    const { formatMessage } = intl

    let text = {
      emptyDescription: formatMessage({id: 'empty_description'}),
      edit: formatMessage({id: 'edit'})
    }

    let newStopText = {
      headerText: formatMessage({id: 'making_stop_place_title'}),
      bodyText: formatMessage({id: 'making_stop_place_hint'})
    }

    const searchBoxWrapperStyle = {
      top: 90,
      background: "white",
      height: "auto",
      width: 460,
      margin: 10,
      position: "absolute",
      zIndex: 999,
      padding: 10,
      border: "1px solid rgb(81, 30, 18)"
    }

    const menuItems = dataSource.map( element => ({
      ...element,
      value: (
          <MenuItem
            style={{marginTop:5, paddingRight: 25, marginLeft: -10}}
            primaryText={element.text}
            secondaryText={(<ModalityIcon
                iconStyle={{float: 'left', transform: 'translateY(10px)'}}
                type={element.markerProps.stopPlaceType}
              />
            )}
          />
      )}
    ))

    let { showFilter, coordinatesDialogOpen } = this.state

    return (
      <div>
        <CoordinatesDialog
          open={coordinatesDialogOpen}
          handleClose={ () => this.setState({coordinatesDialogOpen: false})}
          handleConfirm={this.handleSubmitCoordinates.bind(this)}
          intl={intl}
        />
        <div style={searchBoxWrapperStyle}>
          <div key='search-name-wrapper'>
            <SearchIcon style={{verticalAlign: 'middle', marginRight: 5}}/>
            <AutoComplete
              textFieldStyle={{width: 380}}
              openOnFocus
              hintText={formatMessage({id: "filter_by_name"})}
              dataSource={menuItems}
              filter={(searchText, key) => searchText !== ''}
              onUpdateInput={this.handleUpdateInput.bind(this)}
              maxSearchResults={7}
              searchText={this.props.searchText}
              ref="searchText"
              onNewRequest={this.handleNewRequest.bind(this)}
              listStyle={{width: 'auto'}}
            />
          </div>
          { showFilter
            ? null
            : <RaisedButton onClick={() => { this.handleToggleFilter(true)} }>{formatMessage({id: 'filters'})}</RaisedButton>
          }
          <div style={{float: "right", marginTop: -45}}>
            <IconButton style={{verticalAlign: 'middle'}} onClick={this.handleClearSearch.bind(this)}  iconClassName="material-icons">
              clear
            </IconButton>
          </div>
          { showFilter
            ? <SearchFilter
                intl={intl}
                favorited={favorited}
                dispatch={this.props.dispatch}
                stopPlaceFilter={this.props.stopPlaceFilter}
                chipsAdded={this.props.topoiChips}
            />
            : null
          }
          <div key='searchbox-edit'>
            {activeMarker
              ?  <SearchBoxDetails
                   text={text}
                   handleEdit={this.handleEdit.bind(this)}
                   marker={activeMarker} handleChangeCoordinates={this.handleChangeCoordinates.bind(this)}
                   userSuppliedCoordinates={missingCoordinatesMap && missingCoordinatesMap[activeMarker.markerProps.id]}
              />
              :  null
            }
            <div style={{marginTop: "30px"}}>
              { isCreatingNewStop
                ? <NewStopPlace text={newStopText}/>
                :
                <RaisedButton
                  onClick={this.handleNewStop.bind(this)}
                  style={{float: "right"}}
                  icon={<ContentAdd/>}
                  primary={true}
                  label={formatMessage({id: 'new_stop'})}
                />
              }
            </div>
          </div>
        </div>
      </div>
    )
  }
}

const mapStateToProps = state => {

  var favoriteManager = new FavoriteManager()
  const { stopType, topoiChips, text } = state.user.searchFilters
  var favoriteContent = favoriteManager.createSavableContent('', text, stopType, topoiChips)
  var favorited = favoriteManager.isFavoriteAlreadyStored(favoriteContent)

  return {
    activeMarker: state.stopPlaces.activeMarker,
    dataSource: state.stopPlaces.stopPlaceNames.places,
    isCreatingNewStop: state.user.isCreatingNewStop,
    stopPlaceFilter: state.user.searchFilters.stopType,
    topoiChips: state.user.searchFilters.topoiChips,
    favorited: favorited,
    missingCoordinatesMap: state.user.missingCoordsMap,
    searchText: state.user.searchText
  }
}

export default injectIntl(connect(mapStateToProps)(SearchBox))
