import jsPDF from 'jspdf';
import { formatForCurrency, formatInvoiceNumber, calculateFees, calculateTotal, calculateSubTotal } from './utils';
import dictionary from './multiLangDict';
import Roboto from '../Assets/fonts/Roboto-Regular-normal'
import RobotoBold from '../Assets/fonts/Roboto-Bold-bold'



const createPDF = ({ invoiceItems, feesPnt, discountAmnt, clientInfo, invoiceNumber, currency, projectName, lang }) => {

    const translate = (key) => {
        if (lang === 'Serbian') return dictionary.serbian[key]
        return dictionary.english[key]
    }

    let billingName = clientInfo.name || ' ';
    let billingAddress = clientInfo.address || ' ';
    let billingEmail = clientInfo.email || ' ';
    let billingPhone = clientInfo.phone || ' ';

    const generateInvoicePaymentInfo = (jspdfDoc) => {
        jspdfDoc.setLineHeightFactor(1.5)

        // 'Invoice To' Section
        jspdfDoc.setFontSize(10);
        jspdfDoc.setFontType('bold');
        jspdfDoc.setTextColor('#000');
        jspdfDoc.text(`${translate("invoice_to")}`, marginLeftPage, marginTopPage + 120);

        // 'Payment Info' Section
        jspdfDoc.text(`${translate("payment_info")}`, columnTwoStart, marginTopPage + 120);


        // Invoice Name 
        jspdfDoc.setFontSize(7);
        jspdfDoc.setFontType('bold');
        jspdfDoc.text(`${translate("name")} :`, marginLeftPage, marginTopPage + 140);
        jspdfDoc.text(`${translate("phone_number")} :`, marginLeftPage, marginTopPage + 155);
        jspdfDoc.text(`${translate("email")} :`, marginLeftPage, marginTopPage + 170);
        jspdfDoc.text(`${translate("address")} :`, marginLeftPage, marginTopPage + 185);
        jspdfDoc.text(`${translate("bank_name")} :`, columnTwoStart, marginTopPage + 140);
        jspdfDoc.text(`${translate("iban")} :`, columnTwoStart, marginTopPage + 155);
        jspdfDoc.text(`${translate("swift_code")} :`, columnTwoStart, marginTopPage + 170);
        jspdfDoc.text(`${translate("account_holder")} :`, columnTwoStart, marginTopPage + 185);



        // Set font weight to normal 
        jspdfDoc.setFontType('normal');

        // Invoice Name Value
        jspdfDoc.text(billingName, marginLeftPage + 60, marginTopPage + 140);
        // Invoice Phone Value
        jspdfDoc.text(billingPhone, marginLeftPage + 60, marginTopPage + 155);
        // Invoice Email Value
        jspdfDoc.text(billingEmail, marginLeftPage + 60, marginTopPage + 170);
        // Invoice Address Value
        jspdfDoc.text(jspdfDoc.splitTextToSize(billingAddress, 100), marginLeftPage + 60, marginTopPage + 185);
        // Bank Name Value
        jspdfDoc.text('Unicredit bank Serbia JSC', columnTwoStart + 60, marginTopPage + 140);
        // Account Number Value
        jspdfDoc.text(translate("iban_value"), columnTwoStart + 60, marginTopPage + 155);
        // Bank Code Value
        jspdfDoc.text(translate("swift_code_value"), columnTwoStart + 60, marginTopPage + 170);
        // Account Holder Value
        jspdfDoc.text(jspdfDoc.splitTextToSize('ALEX STAVROS TSELEKIDIS PR TWO STUDIO', 100), columnTwoStart + 60, marginTopPage + 185);



        // Small Dividers Left Column
        jspdfDoc.setDrawColor('#B8B9BC')
        jspdfDoc.setLineWidth(.5)
        jspdfDoc.line(marginLeftPage + 60, marginTopPage + 145, columnOneEnd, marginTopPage + 145, 'F')
        jspdfDoc.line(marginLeftPage + 60, marginTopPage + 160, columnOneEnd, marginTopPage + 160, 'F')
        jspdfDoc.line(marginLeftPage + 60, marginTopPage + 175, columnOneEnd, marginTopPage + 175, 'F')
        jspdfDoc.line(marginLeftPage + 60, marginTopPage + 185 + jspdfDoc.splitTextToSize(billingAddress, 100).length * 6, columnOneEnd, marginTopPage + 185 + jspdfDoc.splitTextToSize(billingAddress, 100).length * 6, 'F')
        // Small Dividers Right Column
        jspdfDoc.line(columnTwoStart + 60, marginTopPage + 145, marginRightPage, marginTopPage + 145, 'F')
        jspdfDoc.line(columnTwoStart + 60, marginTopPage + 160, marginRightPage, marginTopPage + 160, 'F')
        jspdfDoc.line(columnTwoStart + 60, marginTopPage + 175, marginRightPage, marginTopPage + 175, 'F')
        jspdfDoc.line(columnTwoStart + 60, marginTopPage + 190 + jspdfDoc.splitTextToSize(billingAddress, 100).length * 6, marginRightPage, marginTopPage + 190 + jspdfDoc.splitTextToSize(billingAddress, 100).length * 6, 'F')
    };

    let doc = new jsPDF({
        orientation: 'p',
        unit: 'px',
        foqrmat: 'a4'
    });


    doc.addFileToVFS('Roboto-Regular.ttf', Roboto)
    doc.addFileToVFS('Roboto-Bold.ttf', RobotoBold)
    doc.addFont('Roboto-Regular.ttf', 'Roboto', 'normal')
    doc.addFont('Roboto-Bold.ttf', 'Roboto', 'bold')
    doc.setFont('Roboto')

    let secondaryColor = '#F48472';


    const pdfWidth = doc.internal.pageSize.getWidth();
    const pdfHeight = doc.internal.pageSize.getHeight();
    const marginTopPage = 45;
    const marginBottomPage = pdfHeight - 30;
    const marginLeftPage = 60;
    const marginRightPage = pdfWidth - marginLeftPage;



    const columnWidth = (marginRightPage - marginLeftPage) / 2 - 5

    const columnOneEnd = marginLeftPage + columnWidth
    const columnTwoStart = marginRightPage - (marginRightPage - marginLeftPage) / 2 + 5

    // split available width to 4 columns
    const itemTableColumn1 = {
        start: marginLeftPage,
        end: columnOneEnd,
    }

    const itemTableColumn2 = {
        start: columnTwoStart,
        end: columnTwoStart + 20,
    }

    const itemTableColumn3 = {
        start: columnTwoStart + 30,
        end: columnTwoStart + 20 + (marginRightPage - itemTableColumn2.end - 10) / 2,
    }

    const itemTableColumn4 = {
        start: itemTableColumn3.end + 10,
        end: marginRightPage
    }

    // Address
    // doc.setFont('helvetica');
    doc.setTextColor('#000');
    doc.setFontSize(7);

    // Address
    doc.setFontType('bold');
    doc.text(`${translate("address")}:`, marginLeftPage, marginTopPage + 2);
    doc.setFontType('normal');
    doc.text('Kralja Milutina 23/23', marginLeftPage + 50, marginTopPage + 2);

    // City
    doc.text(translate("city"), marginLeftPage + 50, marginTopPage + 10);

    // VAT No
    doc.setFontType('bold');
    doc.text(`${translate("vat_no")}:`, marginLeftPage, marginTopPage + 20);
    doc.setFontType('normal');
    doc.text('112337268', marginLeftPage + 50, marginTopPage + 20);

    // Reg No
    doc.setFontType('bold');
    doc.text(`${translate("reg_no")}:`, marginLeftPage, marginTopPage + 30);
    doc.setFontType('normal');
    doc.text('66036103', marginLeftPage + 50, marginTopPage + 30);

    // Phone 
    doc.setFontType('bold');
    doc.text(`${translate("phone")}:`, marginLeftPage, marginTopPage + 40);
    doc.setFontType('normal');
    doc.text('+38162456234', marginLeftPage + 50, marginTopPage + 40);


    // Email
    doc.setFontType('bold');
    doc.text(`${translate("email")}:`, marginLeftPage, marginTopPage + 50);
    doc.setFontType('normal');
    doc.text('hi@two.rs', marginLeftPage + 50, marginTopPage + 50);

    // Website
    doc.setFontType('bold');
    doc.text(`${translate("website")}:`, marginLeftPage, marginTopPage + 60);
    doc.setFontType('normal');
    doc.text('www.two.rs', marginLeftPage + 50, marginTopPage + 60);

    // Date
    const today = new Date();
    doc.setFontType('bold');
    doc.text(`${translate("date_issued")}:`, marginLeftPage, marginTopPage + 70);
    doc.setFontType('normal');
    doc.text(today.toDateString(), marginLeftPage + 50, marginTopPage + 70);

    // Date

    if(lang !== "Serbian") {
        const todayPlus5 = new Date();
        todayPlus5.setDate(todayPlus5.getDate() + 5);
        doc.setFontType('bold');
        doc.text('Due Date:', marginLeftPage, marginTopPage + 80);
        doc.setFontType('normal');
        doc.text(todayPlus5.toDateString(), marginLeftPage + 50, marginTopPage + 80);
    }

    // Invoice Number
    doc.setFontType('bold');
    doc.text(`${translate("invoice")} #:`, marginLeftPage, marginTopPage + 90);
    doc.setFontType('normal');
    doc.text(formatInvoiceNumber(invoiceNumber), marginLeftPage + 50, marginTopPage + 90);

    const originalLogoDim = {
        w: 1000,
        h: 499
    }

    doc.addImage(document.getElementById('img-logo'), 'PNG', columnTwoStart, 40, originalLogoDim.w * 0.1, originalLogoDim.h * 0.1, 'company logo', 'FAST');

    // Sub title
    doc.setFontSize(4);
    doc.setFontType('bold');
    doc.setTextColor('#000');
    doc.text('ALEX STAVROS TSELEKIDIS PR TWO STUDIO', columnTwoStart, marginTopPage + 60);



    // Dividers
    doc.setDrawColor('#ECECEE')
    doc.setLineWidth(1)
    doc.line(marginLeftPage, marginTopPage + 100, columnOneEnd, marginTopPage + 100, 'F')
    doc.line(columnTwoStart, marginTopPage + 100, marginRightPage, marginTopPage + 100, 'F')
    doc.setDrawColor(secondaryColor)
    doc.line(marginLeftPage, marginTopPage + 100, marginLeftPage + 30, marginTopPage + 100, 'F')
    doc.line(columnTwoStart, marginTopPage + 100, columnTwoStart + 30, marginTopPage + 100, 'F')


    generateInvoicePaymentInfo(doc);


    doc.setDrawColor('#ECECEE')
    doc.setLineWidth(1)
    doc.line(marginLeftPage, marginTopPage + 230, marginRightPage, marginTopPage + 230, 'F')
    doc.setDrawColor(secondaryColor)
    doc.line(marginLeftPage, marginTopPage + 230, marginLeftPage + 30, marginTopPage + 230, 'F')



    const generateInvoiceItemTable = (top) => {

        // 'ITEM / SERVICE' Section
        doc.setFontSize(10);
        doc.setFontType('bold');
        doc.setTextColor('#000');
        doc.text(projectName ? `${translate("item_details")} - ${projectName}` : translate("item_details"), marginLeftPage, top);


        const drawTableHeader = (jspdfDoc, mT) => {
            // Table Headers
            doc.setLineWidth(.8)
            doc.setFontSize(8);
            doc.setFontType('bold');
            doc.setTextColor('#000');
            doc.text('Description', itemTableColumn1.start, mT)
            doc.text('Qty', itemTableColumn2.start, mT)
            doc.text('Unit Price', itemTableColumn3.start, mT)
            doc.text('Amount', itemTableColumn4.start, mT)
            doc.setDrawColor(secondaryColor)
            jspdfDoc.line(itemTableColumn1.start, mT + 5, itemTableColumn1.end, mT + 5, 'F')
            jspdfDoc.line(itemTableColumn2.start, mT + 5, itemTableColumn2.end, mT + 5, 'F')
            jspdfDoc.line(itemTableColumn3.start, mT + 5, itemTableColumn3.end, mT + 5, 'F')
            jspdfDoc.line(itemTableColumn4.start, mT + 5, itemTableColumn4.end, mT + 5, 'F')
        }

        const drawTableRowLine = (jspdfDoc, mT) => {
            doc.setDrawColor('#B8B9BC')
            jspdfDoc.line(itemTableColumn1.start, mT, itemTableColumn1.end, mT, 'F')
            jspdfDoc.line(itemTableColumn2.start, mT, itemTableColumn2.end, mT, 'F')
            jspdfDoc.line(itemTableColumn3.start, mT, itemTableColumn3.end, mT, 'F')
            jspdfDoc.line(itemTableColumn4.start, mT, itemTableColumn4.end, mT, 'F')
        }

        const drawTableRowData = (jspdfDoc, mT, item) => {
            jspdfDoc.setFontType('normal')
            jspdfDoc.setFontSize(7)
            mT -= 4
            const options = { align: 'right' };
            jspdfDoc.text('' + item.description, itemTableColumn1.start, mT)
            jspdfDoc.text('' + item.qty, itemTableColumn2.end, mT, options)
            jspdfDoc.text('' + item.uprice + '', itemTableColumn3.end, mT, options)
            jspdfDoc.text('' + item.uprice * item.qty + '', itemTableColumn4.end, mT, options)
        }

        const nextTableRowIsInBoundaries = (y) => {
            return marginTopPage < y && y < marginBottomPage;
        }


        doc.setLineWidth(.8)
        drawTableHeader(doc, top + 20)
        let currH = 25 + 13
        let step = 13;
        let counter = 0;

        for (let item = 0; item < invoiceItems.length; item++) {
            const element = invoiceItems[item];
            if (!nextTableRowIsInBoundaries(top + currH + (step * counter))) {
                console.log('goes to new Page')
                doc.addPage()
                counter = 0
                top = marginTopPage
                currH = 5 + 13
                drawTableHeader(doc, top)
            }
            drawTableRowLine(doc, top + currH + (step * counter))
            drawTableRowData(doc, top + currH + (step * counter), element)

            counter++;
        }

        return { yEnd: top + currH + (step * counter) }
    }

    const generateInvoiceSummary = (top) => {

        const drawTotalHeaderLine = (jspdfDoc) => {
            jspdfDoc.setDrawColor(secondaryColor)
            jspdfDoc.line(itemTableColumn2.start, top, itemTableColumn3.end, top, 'F')
            jspdfDoc.line(itemTableColumn4.start, top, itemTableColumn4.end, top, 'F')
        }


        const drawTotalRowLine = (jspdfDoc, mT) => {
            jspdfDoc.setDrawColor('#B8B9BC')
            jspdfDoc.line(itemTableColumn2.start, top + mT, itemTableColumn3.end, top + mT, 'F')
            jspdfDoc.line(itemTableColumn4.start, top + mT, itemTableColumn4.end, top + mT, 'F')
        }

        const drawTotalRowData = (jspdfDoc, mT, item) => {
            jspdfDoc.setFontType('bold')
            jspdfDoc.setFontSize(8)
            mT -= 4;
            jspdfDoc.text(item.title, itemTableColumn2.start, top + mT)
            jspdfDoc.text(item.value, itemTableColumn4.end, top + mT, { align: 'right' })
        }



        const currH = 14;
        const step = 14;
        const arr = [
            {
                title: translate("sub_total"),
                value: `${formatForCurrency(currency, calculateSubTotal(invoiceItems))}`
            },
            {
                title: translate("fees"),
                value: `+ ${formatForCurrency(currency, calculateFees(invoiceItems, feesPnt))}`
            },
            {
                title: translate("discount"),
                value: `- ${formatForCurrency(currency, discountAmnt)}`
            },
            {
                title: translate("grand_total"),
                value: `${formatForCurrency(currency, calculateTotal({ items: invoiceItems, fees: feesPnt, discount: discountAmnt }))}`
            }

        ]



        drawTotalHeaderLine(doc)

        for (let item = 0; item < arr.length; item++) {
            const element = arr[item];

            drawTotalRowLine(doc, currH + (step * item));
            drawTotalRowData(doc, currH + (step * item), element)

        }

        doc.setFontSize(10);
        doc.setFontType('bold');
        doc.text('Terms and Conditions', marginLeftPage, top)
        doc.setFontSize(5);
        doc.setFontType('normal');


        doc.text(doc.splitTextToSize(translate("term_con_val_1"), 150), marginLeftPage, top + 10)
        if (lang === "Serbian")
            doc.text(doc.splitTextToSize(translate("term_con_val_2"), 150), marginLeftPage, top + 16)
        // doc.text(doc.splitTextToSize('Notification for exception of VAT payment: VAT tax should not be payed according to subpart 12/3/4/4 of VAT legal act.', 150), marginLeftPage, top + 10)

    }

    const { yEnd } = generateInvoiceItemTable(marginTopPage + 250)

    if (yEnd < 538) {
        generateInvoiceSummary(538)
    } else {
        doc.addPage();
        doc.setLineWidth(.8)
        generateInvoiceSummary(marginTopPage)
    }

    let file = doc.output('blob');
    // let file = doc.output('dataurlnewwindow');
    return file;
};

export default createPDF;