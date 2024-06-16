async function generateCertificates() {
    const fileInput = document.getElementById('csvFileInput');
    const files = fileInput.files;
    if (files.length === 0) {
        alert('Please select a CSV file.');
        return;
    }

    const file = files[0];
    const text = await file.text();
    const names = text.split('\n').map(name => name.trim()).filter(name => name !== '');

    if (names.length === 0) {
        alert('The CSV file is empty or contains no valid names.');
        return;
    }

    const templateBytes = await fetch('template.pdf').then(res => res.arrayBuffer());
    const { PDFDocument, rgb } = PDFLib;

    // Iterate through each name to generate and download certificates
    for (const name of names) {
        // Step 1: Create a new PDF document for each name
        const pdfDoc = await PDFDocument.load(templateBytes);

        // Step 2: Get the first page of the document
        const pages = pdfDoc.getPages();
        const firstPage = pages[0];

        // Step 3: Define the font and size
        const fontSize = 40;
        const fontSizeDate = 12;
        const fontText = await pdfDoc.embedFont(PDFLib.StandardFonts.TimesRomanBold);
        const fontDate = await pdfDoc.embedFont(PDFLib.StandardFonts.TimesRomanItalic);

        // Step 4: Calculate text widths and coordinates for text placement
        const nameWidth = fontText.widthOfTextAtSize(name, fontSize);
        const dateWidth = fontDate.widthOfTextAtSize(formatDate(new Date()), fontSizeDate);
        const pageWidth = firstPage.getWidth();
        const nameX = (pageWidth - nameWidth) / 2;
        const nameY = 220;  // Y coordinate for the name
        const dateX = (pageWidth - dateWidth) / 2; // Center align date
        const dateY = 140;  // Y coordinate for the date

        // Step 5: Draw the name on the first page
        firstPage.drawText(name, {
            x: nameX,
            y: nameY,
            size: fontSize,
            font: fontText,
            color: rgb(0, 0, 0),
        });

        // Step 6: Draw the date on the first page with full formatting
        firstPage.drawText(formatDate(new Date()), {
            x: dateX,
            y: dateY,
            size: fontSizeDate,
            font: fontDate,
            color: rgb(0, 0, 0),
        });

        // Step 7: Serialize the PDFDocument to bytes (a Uint8Array)
        const pdfBytes = await pdfDoc.save();

        // Step 8: Create a blob from the pdfBytes
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });

        // Step 9: Create a temporary link element and download the certificate
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `${name}_certificate.pdf`;
        document.body.appendChild(link); // Append link to the body
        link.click(); // Programmatically trigger the download

        // Step 10: Clean up by removing the temporary link
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
    }
}

// Function to format the date in "Date: 21st September, 2021" format
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
