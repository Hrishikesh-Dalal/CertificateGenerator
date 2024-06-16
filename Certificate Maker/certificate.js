async function generateCertificate() {
    // Step 1: Get the name and current date
    const name = document.getElementById('nameInput').value;
    const currentDate = formatDate(new Date()); // Formatting the date

    // Step 2: Fetch the existing PDF template
    const response = await fetch('template.pdf');
    if (!response.ok) {
        throw new Error('Network response was not ok ' + response.statusText);
    }
    const existingPdfBytes = await response.arrayBuffer();

    // Step 3: Load the PDF document into pdf-lib
    const { PDFDocument, rgb } = PDFLib;
    const pdfDoc = await PDFDocument.load(existingPdfBytes);

    // Step 4: Get the first page of the document
    const pages = pdfDoc.getPages();
    const firstPage = pages[0];

    // Step 5: Define the font and size
    const fontSize = 40; 
    const fontSizeDate = 12;  // Adjust font size as needed
  
    const fontText = await pdfDoc.embedFont(PDFLib.StandardFonts.TimesRomanBold);
    const fontDate = await pdfDoc.embedFont(PDFLib.StandardFonts.TimesRomanItalic);


    // Step 6: Calculate text widths
    const nameWidth = fontText.widthOfTextAtSize(name, fontSize);
    const dateWidth = fontDate.widthOfTextAtSize(currentDate, fontSizeDate);

    // Step 7: Calculate coordinates for text placement
    const pageWidth = firstPage.getWidth();
    const nameX = (pageWidth - nameWidth) / 2;
    const nameY = 220;  // Y coordinate for the name
    const dateX = (pageWidth - dateWidth) / 2;;   // Adjust this value to move date to the left edge
    const dateY = 140;  // Y coordinate for the date

    // Step 8: Draw the name on the first page
    firstPage.drawText(name, {
        x: nameX,
        y: nameY,
        size: fontSize,
        font: fontText,
        color: rgb(0, 0, 0),
    });

    // Step 9: Draw the date on the first page with full formatting
    firstPage.drawText(currentDate, {
        x: dateX,
        y: dateY,
        size: fontSizeDate,
        font: fontDate,
        color: rgb(0, 0, 0),
    });

    // Step 10: Serialize the PDFDocument to bytes (a Uint8Array)
    const pdfBytes = await pdfDoc.save();

    // Step 11: Create a blob from the pdfBytes
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });

    // Step 12: Create a link element
    const link = document.createElement('a');

    // Step 13: Set the download attribute with a filename
    link.href = URL.createObjectURL(blob);
    link.download = `${name}_certificate.pdf`;

    // Step 14: Append the link to the body
    document.body.appendChild(link);

    // Step 15: Programmatically click the link to trigger the download
    link.click();

    // Step 16: Remove the link from the document
    document.body.removeChild(link);
}

// Function to format the date in "21st September, 2021" format
function formatDate(date) {
    const day = date.getDate();
    const month = date.toLocaleString('default', { month: 'long' });
    const year = date.getFullYear();
    const suffix = getOrdinalSuffix(day);
    return `Date: ${day}${suffix} ${month}, ${year}`;
}

// Function to get the ordinal suffix for the day
function getOrdinalSuffix(day) {
    if (day === 1 || day === 21 || day === 31) {
        return 'st';
    } else if (day === 2 || day === 22) {
        return 'nd';
    } else if (day === 3 || day === 23) {
        return 'rd';
    } else {
        return 'th';
    }
}
