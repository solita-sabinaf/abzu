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

import PropTypes from "prop-types";
import React from "react";
import "../../styles/menu.css";
import { getSvgIconByTypeOrSubmode } from "../../utils/iconUtils";

class ModalityIconImg extends React.Component {
  shouldComponentUpdate(nextProps) {
    if (nextProps.forceUpdate) {
      return true;
    }

    if (
      this.props.type === nextProps.type &&
      this.props.submode === nextProps.submode
    ) {
      return false;
    }

    return true;
  }

  render() {
    let svgStyle = {
      width: 30,
      height: 25,
      ...this.props.svgStyle,
    };

    const iconStyle = this.props.iconStyle || {
      float: "left",
      transform: "translateY(2px)",
    };

    const icon = getSvgIconByTypeOrSubmode(this.props.submode, this.props.type);

    let style = {
      ...(this.props.style || {}),
    };

    return (
      <span className="clear" style={iconStyle}>
        <img alt="" style={{ ...style, ...svgStyle }} src={icon} />
      </span>
    );
  }
}

ModalityIconImg.propTypes = {
  type: PropTypes.string.isRequired,
  submode: PropTypes.string,
  iconStyle: PropTypes.object,
  style: PropTypes.object,
  forceUpdate: PropTypes.bool,
};

export default ModalityIconImg;
