import React from 'react';
import { WidgetContainer } from './WidgetContainer';
import { Button } from '../Atoms';
import { EventsStore } from '../EventsStore';
import { CalendarsContext } from '../Contexts/CalendarsContext';

export function DataExport({ label, durations, }: { readonly label: string, readonly durations: EventsStore | undefined }): JSX.Element {
  
  const calendars = React.useContext(CalendarsContext)
  

  function exportToCSV() {
      if (durations === undefined || calendars === undefined) return;
      var csv = calendars.flatMap(({id, summary}) => {
        return Object.entries(durations[id] ?? {})
        .map(([date,duration])=>[summary,date,duration].join(','))
      })
      .join("\n")

      downloadFile(`Calendar-Stats.csv`, csv ?? '')
      
  }

  const downloadFile = async (
    fileName: string,
    text: string
  ): Promise<void> =>
    new Promise((resolve) => {
      const iframe = document.createElement('iframe');
      iframe.addEventListener('load', () => {
        if (iframe.contentWindow === null) return;
        const element = iframe.contentWindow.document.createElement('a');
        element.setAttribute(
          'href',
          `data:text/plain;charset=utf-8,${encodeURIComponent(text)}`
        );
        element.setAttribute('download', fileName);
  
        element.style.display = 'none';
        iframe.contentWindow.document.body.append(element);
  
        element.click();
        globalThis.setTimeout(() => {
          iframe.remove();
          resolve();
        }, 100);
      });
      const html = '<body></body>';
      document.body.append(iframe);
      iframe.contentWindow?.document.open();
      iframe.contentWindow?.document.write(html);
      iframe.contentWindow?.document.close();
    });
  
  
  return <WidgetContainer header={label}>
    <Button.White
              title={'Export to CSV'}
              aria-label={'Export to CSV'}
              onClick={exportToCSV}
              disabled={durations === undefined}
              className="!p-1"
            >
    </Button.White>
    </WidgetContainer>;
}

