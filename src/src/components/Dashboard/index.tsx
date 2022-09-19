import React from 'react';
import { commonText } from '../../localization/common';
import { Widget } from '../Widget';

export const Dashboard = (props: { closeHandler: () => void; widgets: Array<Array<string>> }) => {
    
    // NOTE: We might need to change the spacing a bit to center header better
    return (
        <> 
            <div id="dash-header" style={{ display: "flex", flexDirection: "row", width: "100%"}}>
                
                <h1 style={{margin: "0 auto", textAlign: "center"}}>DASHBOARD</h1>
                <button type="button" onClick={props.closeHandler}>
                    {commonText('close')}
                </button>
            </div>
            <div style={{ width: "100%", opacity: "90%", height: "100%", display: "flex", flexDirection: "row", flexWrap: "wrap" }}>
                {props.widgets.map(([header, body]) => 
                    <Widget headerText={header} bodyText={body} />)
                }
            </div>
        </>
    );
}
