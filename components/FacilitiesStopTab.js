import React from 'react'
import Checkbox from 'material-ui/Checkbox'
import TicketMachine from '../static/icons/facilities/TicketMachine'
import BusShelter from '../static/icons/facilities/BusShelter'
import Divider from 'material-ui/Divider'
import MdWc from 'material-ui/svg-icons/notification/wc'
import WaitingRoom from '../static/icons/facilities/WaitingRoom'
import ToolTipIcon from './ToolTipIcon'


class FacilitiesStopTab extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      ticketMachine: false,
      busShelter: false,
      WC: false,
      waitingRoom: false
    }
  }

  render() {

    const { formatMessage } = this.props.intl
    const { ticketMachine, busShelter, WC, waitingRoom } = this.state

    return (
      <div style={{padding: 10}}>
        <div style={{marginTop: 10}}>
          <div style={{display: 'flex',justifyContent: 'space-between'}}>
            <Checkbox
              checked={ticketMachine}
              checkedIcon={<TicketMachine />}
              uncheckedIcon={<TicketMachine style={{fill: '#8c8c8c', opacity: '0.8'}}  />}
              label={ ticketMachine ? formatMessage({id: 'ticketMachine'}) : formatMessage({id: 'ticketMachine_no'}) }
              labelStyle={{fontSize: '0.8em'}}
              style={{width: '80%'}}
              onCheck={(e,v) => this.setState({ticketMachine: v})}
            />
            <ToolTipIcon title={formatMessage({id: 'ticketMachine_stop_hint'})}/>
          </div>
          <Divider style={{marginTop: 10, marginBottom: 10}}/>
        </div>
        <div style={{marginTop: 10}}>
          <div style={{display: 'flex', justifyContent: 'space-between'}}>
            <Checkbox
              checked={busShelter}
              checkedIcon={<BusShelter />}
              uncheckedIcon={<BusShelter style={{fill: '#8c8c8c', opacity: '0.8'}}  />}
              label={ busShelter ? formatMessage({id: 'busShelter'}) : formatMessage({id: 'busShelter_no'}) }
              labelStyle={{fontSize: '0.8em'}}
              style={{width: '80%'}}
              onCheck={(e,v) => this.setState({busShelter: v})}
            />
            <ToolTipIcon title={formatMessage({id: 'busShelter_stop_hint'})}/>
          </div>
          <Divider style={{marginTop: 10, marginBottom: 10}}/>
        </div>
        <div style={{marginTop: 10}}>
          <div style={{display: 'flex',justifyContent: 'space-between'}}>
            <Checkbox
              checked={WC}
              checkedIcon={<MdWc />}
              uncheckedIcon={<MdWc style={{fill: '#8c8c8c', opacity: '0.8'}}  />}
              label={ WC ? formatMessage({id: 'wc'}) : formatMessage({id: 'wc_no'}) }
              labelStyle={{fontSize: '0.8em'}}
              style={{width: '80%'}}
              onCheck={(e,v) => this.setState({WC: v})}
            />
            <ToolTipIcon title={formatMessage({id: 'wc_stop_hint'})}/>
          </div>
          <Divider style={{marginTop: 10, marginBottom: 10}}/>
        </div>
        <div style={{marginTop: 10}}>
          <div style={{display: 'flex',justifyContent: 'space-between'}}>
            <Checkbox
              checked={waitingRoom}
              checkedIcon={<WaitingRoom />}
              uncheckedIcon={<WaitingRoom style={{fill: '#8c8c8c', opacity: '0.8'}}  />}
              label={ waitingRoom ? formatMessage({id: 'waiting_room'}) : formatMessage({id: 'waiting_room_no'}) }
              labelStyle={{fontSize: '0.8em'}}
              style={{width: '80%'}}
              onCheck={(e,v) => this.setState({waitingRoom: v})}
            />
            <ToolTipIcon title={formatMessage({id: 'waitingroom_stop_hint'})}/>
          </div>
          <Divider style={{marginTop: 10, marginBottom: 10}}/>
        </div>
      </div>
    )
  }
}

export default FacilitiesStopTab