import React from 'react';
import "./widget.css"

export const Widget = (props: { headerText: string ; bodyText: string; }) => {

    return (
        <div className='widget'>
            <h2>Widget Header: {props.headerText}</h2>
            <h6>Widget Body: {props.bodyText}</h6>
        </div>
    );
}
