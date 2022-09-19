import React from 'react';
import { commonText } from '../../localization/common';
import { Widget } from '../Widget';

export const Dashboard = (props: { closeHandler: () => void; widgets: Array<WidgetObj> }) => {
    
    // NOTE: We might need to change the spacing a bit to center header better
    return (
        <> 
            <div className='flex flex-row' >
                
                <h1 className='mx-auto my-0 text-center'>DASHBOARD</h1>
                <button type="button" onClick={props.closeHandler}>
                    {commonText('close')}
                </button>
            </div>
            <div className='flex flex-row flex-wrap w-full h-full opacity-90 text-center scroll-auto overflow-y-scroll'>
                {props.widgets.map((widgObj) => 
                    <Widget key={widgObj.header} widgObj={widgObj} />)
                }
            </div>
        </>
    );
}
