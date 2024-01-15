import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { flush } from '@angular/core/testing';
import jsPDF from 'jspdf';
import autoTable, {
  CellDef,
  CellHookData,
  CellInput,
  Color,
  LineWidths,
  MarginPaddingInput,
  RowInput,
  Styles,
} from 'jspdf-autotable';
import { take } from 'rxjs';

@Injectable()
export class InvoiceService {
  private deliveryNotePdf: jsPDF = new jsPDF({
    orientation: 'p',
    format: [842, 595],
    unit: 'pt',
    hotfixes: ['px_scaling'],
  });

  private robotoFontRegularContent!: string;

  constructor(private httpClient: HttpClient) {}

  open() {
    this.httpClient
      .get('./fonts/roboto-regular-bold.txt', { responseType: 'text' })
      .pipe(take(1))
      .subscribe((font: string) => {
        this.robotoFontRegularContent = font;
        console.log(this.robotoFontRegularContent);
        const startOfTable = 100;
        const tableMargin = 24;
        const tableTopBottomMargin = 45;
        const basicCellPadding: MarginPaddingInput = {
          top: 8,
          bottom: 9,
          right: 8,
          left: 8,
        };

        autoTable(this.deliveryNotePdf, {
          columnStyles: this.getColumnStyles(),
          startY: startOfTable,
          styles: {
            fontSize: 9,
          },
          headStyles: {
            lineColor: '#DBDBDB',
            lineWidth: {
              bottom: 0.5,
              top: 0.5,
            },
            overflow: 'ellipsize',
          },
          bodyStyles: {
            fontSize: 9,
            fontStyle: 'normal',
            textColor: '#202020',
            halign: 'left',
            valign: 'middle',
            cellPadding: basicCellPadding,
            lineColor: '#DBDBDB',
            lineWidth: {
              bottom: 0.5,
              top: 0,
              left: 0,
              right: 0,
            },
            overflow: 'ellipsize',
          },
          footStyles: {
            fontSize: 9,
            fontStyle: 'normal',
            textColor: '#202020',
            halign: 'left',
            valign: 'middle',
            lineColor: '#ffffff',
            lineWidth: 0,
            overflow: 'ellipsize',
            fillColor: '#ffffff',
          },
          tableLineWidth: 0, // changed to zero
          tableLineColor: '#DBDBDB', // no effect when line with is 0
          margin: {
            top: tableTopBottomMargin,
            left: tableMargin,
            right: tableMargin,
            bottom: tableTopBottomMargin,
          },
          head: this.getHeader(),
          body: [
            ['Item 1', '1', '2.30'],
            ['Item 2', '3', '6.60'],
            ['Item 3', '2', '7.20'],
          ],
          foot: this.getFooter(),
          willDrawCell: (data: CellHookData) => {
            const totalColumns = Object.keys(data.row.cells).length - 1;

            const isFirstHeaderColumn =
              data.column.index === 0 && data.section === 'head';
            const isLastHeaderColumn =
              data.column.index === totalColumns && data.section === 'head';

            const isFirstBodyColumn =
              data.column.index === 0 && data.section === 'body';
            const isLastBodyColunn =
              data.column.index === totalColumns && data.section === 'body';

            const isLastBodyRow = data.row.index === data.table.body.length - 1;

            // add left border to the first column
            if (isFirstHeaderColumn || isFirstBodyColumn) {
              data.cell.styles = {
                ...data.cell.styles,
                lineWidth: {
                  ...(data.cell.styles.lineWidth as Partial<LineWidths>),
                  left: 0.5,
                },
              };
            }

            if (isLastHeaderColumn || isLastBodyColunn) {
              data.cell.styles = {
                ...data.cell.styles,
                lineWidth: {
                  ...(data.cell.styles.lineWidth as Partial<LineWidths>),
                  right: 0.5,
                },
              };
            }

            if (isLastBodyRow) {
              data.cell.styles = {
                ...data.cell.styles,
                lineWidth: {
                  ...(data.cell.styles.lineWidth as Partial<LineWidths>),
                  bottom: 1,
                },
              };
            }
          },
        });

        this.deliveryNotePdf.html('', {
          callback: (pdfFile: jsPDF) => {
            const filename = `invoice-${new Date().getTime()}`;
            const pdfPreviewWindow = window.open('/') as Window;

            if (pdfPreviewWindow?.document) {
              pdfPreviewWindow.document.title = filename;
            }

            fetch(pdfFile.output('dataurlstring', { filename }))
              .then((res) => res.blob())
              .then((blob) => {
                pdfPreviewWindow.location = URL.createObjectURL(blob);
              });
          },
        });
      });
  }

  private getColumnStyles() {
    const cellColor: Color = '#FFFFFF';
    const textColor = '#202020';
    const basicCellPadding: MarginPaddingInput = {
      left: 8,
      bottom: 13,
      top: 13,
      right: 8,
    };
    const basicColumnStyle: Partial<Styles> = {
      halign: 'left',
      valign: 'middle',
      fontStyle: 'normal',
      fillColor: cellColor,
      cellPadding: basicCellPadding,
      textColor: textColor,
      minCellHeight: 28,
    };

    const columnStyle: Partial<Styles> = {
      ...basicColumnStyle,
      halign: 'left',
      cellWidth: 'auto',
      cellPadding: { left: 8, right: 6 },
    };

    const styles: { [p: string]: Partial<Styles> } = {};

    for (let i = 0; i < 3; i++) {
      styles[i] = { ...columnStyle };
    }

    return styles;
  }

  private getHeader() {
    const headerFillColor: Color = '#ECECEC';
    const headerTextColor: Color = '#202020';

    const headerStyles: Partial<Styles> = {
      fillColor: headerFillColor,
      halign: 'left',
      valign: 'middle',
      fontStyle: 'bold',
      textColor: headerTextColor,
      fontSize: 9,
      cellPadding: { top: 8, bottom: 9, right: 8, left: 8 },
      minCellHeight: 28,
    };

    const columns = ['Name', 'Qty', 'Price'];

    const header: Array<RowInput> = [[]];

    columns.forEach((column) =>
      (header[0] as Array<CellInput>).push({
        content: column,
        styles: { ...headerStyles },
      })
    );

    return header;
  }

  private getFooter(): Array<Array<CellDef>> {
    return [
      [
        {
          content: 'TOTAL:',
          colSpan: 2,
          styles: { halign: 'right' },
        },
        { content: '15.10' },
      ],
    ];
  }
}
