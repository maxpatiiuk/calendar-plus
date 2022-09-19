import React from 'react';

export const Widget = (props: { widgObj: WidgetObj }) => {

    return (
        <div className={props.widgObj.class} >
            <h2>Widget Header: {props.widgObj.header}</h2>
            <h6>Widget Body: {props.widgObj.body}</h6>
        </div>
    );
}
