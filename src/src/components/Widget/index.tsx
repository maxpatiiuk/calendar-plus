import React from 'react';

const defaultClass = "rounded-xl shadow-lg bg-slate-300 hover:shadow-slate-400 hover:shadow-xl mx-auto my-5 h-3/6"

export const Widget = (props: { widgObj: WidgetObj }) => {

    return (
        <div className={props.widgObj.class ?? defaultClass} >
            <h2>Widget Header: {props.widgObj.header}</h2>
            <h6>Widget Body: {props.widgObj.body}</h6>
        </div>
    );
}
