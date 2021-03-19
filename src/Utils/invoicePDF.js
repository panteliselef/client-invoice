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
    let billingPlace = clientInfo.place_issued || ' ';
    let billingPIB = clientInfo.c_pib || ' ';
    let billingMB = clientInfo.c_mb || ' ';

    const generateInvoicePaymentInfo = (jspdfDoc) => {

        const generateEntry = (label, value,left,top,right) => {
            jspdfDoc.setFontSize(7);
            jspdfDoc.setFontType('bold');
            jspdfDoc.text(`${label} :`, left, top);
            // Invoice Address Value
            jspdfDoc.setFontType('normal');
            jspdfDoc.text(jspdfDoc.splitTextToSize(value, 100), left + 60, top);

            jspdfDoc.setDrawColor('#B8B9BC')
            jspdfDoc.setLineWidth(.5)
            jspdfDoc.line(left + 60, top + jspdfDoc.splitTextToSize(value, 100).length * 6, right, top + jspdfDoc.splitTextToSize(value, 100).length * 6, 'F')
            return top +  jspdfDoc.splitTextToSize(value, 100).length * 6;
        }


        jspdfDoc.setLineHeightFactor(1.5)

        // 'Invoice To' Section
        jspdfDoc.setFontSize(10);
        jspdfDoc.setFontType('bold');
        jspdfDoc.setTextColor('#000');
        jspdfDoc.text(`${translate("invoice_to")}`, marginLeftPage, marginTopPage + 120);

        // 'Payment Info' Section
        jspdfDoc.text(`${translate("payment_info")}`, columnTwoStart, marginTopPage + 120);

        generateEntry(translate("name"),billingName,marginLeftPage,marginTopPage + 140,columnOneEnd);
        generateEntry(translate("phone_number"),billingPhone,marginLeftPage,marginTopPage + 155,columnOneEnd);
        generateEntry(translate("email"),billingEmail,marginLeftPage,marginTopPage + 170,columnOneEnd);
        const addressH = generateEntry(translate("address"),billingAddress,marginLeftPage,marginTopPage + 185,columnOneEnd);

        if(lang === "Serbian") {
            const pibH = generateEntry("PIB",billingPIB,marginLeftPage,addressH + 10,columnOneEnd);
            generateEntry("MB",billingMB,marginLeftPage,pibH + 10,columnOneEnd);
        }


        generateEntry(translate("bank_name"),'Unicredit bank Serbia JSC',columnTwoStart,marginTopPage + 140,marginRightPage);
        generateEntry(translate("iban"),translate("iban_value"),columnTwoStart,marginTopPage + 155,marginRightPage);
        generateEntry(translate("swift_code"),translate("swift_code_value"),columnTwoStart,marginTopPage + 170,marginRightPage);
        generateEntry(translate("account_holder"),'ALEX STAVROS TSELEKIDIS PR TWO STUDIO',columnTwoStart,marginTopPage + 185,marginRightPage);
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
    doc.text(`${translate("date_d")}:`, marginLeftPage, marginTopPage + 80);
    doc.setFontType('normal');

    if (lang !== "Serbian") {
        const todayPlus5 = new Date();
        todayPlus5.setDate(todayPlus5.getDate() + 5);
        doc.text(today.toDateString(), marginLeftPage + 50, marginTopPage + 70);
        doc.text(todayPlus5.toDateString(), marginLeftPage + 50, marginTopPage + 80);
    }else {
        const dateStr = today.toLocaleDateString('sr-Latn',{ weekday: 'short', year: 'numeric', month: 'long', day: 'numeric' }).replaceAll(',',"").replaceAll(".","")
        doc.text(dateStr, marginLeftPage + 50, marginTopPage + 70);
        doc.text(dateStr, marginLeftPage + 50, marginTopPage + 80);


        doc.setFontType('bold');
        doc.text(`${translate("place_issued")}:`, marginLeftPage, marginTopPage + 90);
        doc.setFontType('normal');
        doc.text(billingPlace, marginLeftPage + 50, marginTopPage + 90);
        
    }

    // Invoice Number
    doc.setFontType('bold');
    doc.text(`${translate("invoice")} #:`, marginLeftPage, marginTopPage + 100);
    doc.setFontType('normal');
    doc.text(formatInvoiceNumber(invoiceNumber), marginLeftPage + 50, marginTopPage + 100);

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
    doc.line(marginLeftPage, marginTopPage + 105, columnOneEnd, marginTopPage + 105, 'F')
    doc.line(columnTwoStart, marginTopPage + 105, marginRightPage, marginTopPage + 105, 'F')
    doc.setDrawColor(secondaryColor)
    doc.line(marginLeftPage, marginTopPage + 105, marginLeftPage + 30, marginTopPage + 105, 'F')
    doc.line(columnTwoStart, marginTopPage + 105, columnTwoStart + 30, marginTopPage + 105, 'F')


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
            doc.text(translate('description'), itemTableColumn1.start, mT)
            doc.text(translate('quantity'), itemTableColumn2.start, mT)
            doc.text(translate('unit_price'), itemTableColumn3.start, mT)
            doc.text(translate('amount'), itemTableColumn4.start, mT)
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
            let prevColor;
            if(item.color) {
                prevColor = jspdfDoc.getTextColor()
                jspdfDoc.setTextColor(item.color)
            }
            mT -= 4;
            jspdfDoc.text(item.title, itemTableColumn2.start, top + mT)
            jspdfDoc.text(item.value, itemTableColumn4.end, top + mT, { align: 'right' })

            if(item.color) {
                jspdfDoc.setTextColor(prevColor)
            }
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
                color: secondaryColor,
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