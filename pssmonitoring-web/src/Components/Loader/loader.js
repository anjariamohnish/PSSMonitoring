import React, { Component } from 'react';
import './loader.css';
class Loader extends Component {
    render() {
        return (
            <div hidden={!this.props.active} className="_loading-overlay">
                <div className="sc-bdVaJa eSmrHg" color="#FFF">
                    <div className="sc-htpNat kSIiDU">
                        <div className="sc-bwzfXH fkRHAk">
                            <svg className=" ilsAZR" viewBox="25 25 50 50">
                                <circle className="bqUHVp" color="#FFF" cx="50" cy="50" r="20" fill="none" strokeWidth="2"
                                    strokeMiterlimit="10"></circle>
                            </svg>
                        </div>
                        <div className="message">{this.props.text}</div>
                    </div>
                </div>
            </div>
        );
    }
}
export default Loader 