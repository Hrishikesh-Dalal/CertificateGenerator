// Function to toggle the visibility of manual input fields
function toggleManualInput(selectId, inputId) {
    const selectElement = document.getElementById(selectId);
    const inputElement = document.getElementById(inputId);
    if (selectElement.value === 'manual') {
        inputElement.style.display = 'inline';
    } else {
        inputElement.style.display = 'none';
    }
}

async function generateCertificate() {
    // Step 1: Get the name, alignment options, font size, and font type
    const name = document.getElementById('nameInput').value;
    const alignX = document.getElementById('alignX').value;
    const alignY = document.getElementById('alignY').value;
    const fontSize = parseFloat(document.getElementById('fontSize').value);
    const fontType = document.getElementById('fontType').value;

    if (isNaN(fontSize) || fontSize <= 0) {
        alert('Please enter a valid font size');
        return;
    }

    let nameX, nameY;

    // Step 2: Determine X coordinate based on alignment options or manual input
    if (alignX === 'left') {
        nameX = 50; // Adjust as needed for left alignment
    } else if (alignX === 'center') {
        nameX = 'center'; // Use 'center' flag for center alignment
    } else if (alignX === 'right') {
        nameX = 'right'; // Use 'right' flag for right alignment
    } else if (alignX === 'manual') {
        nameX = parseFloat(document.getElementById('manualXInput').value);
        if (isNaN(nameX)) {
            alert('Please enter a valid number for Manual X coordinate');
            return;
        }
    }

    // Step 3: Determine Y coordinate based on alignment options or manual input
    if (alignY === 'top') {
        nameY = 'top'; // Use 'top' flag for top alignment
    } else if (alignY === 'middle') {
        nameY = 'middle'; // Use 'middle' flag for middle alignment
    } else if (alignY === 'bottom') {
        nameY = 'bottom'; // Use 'bottom' flag for bottom alignment
    } else if (alignY === 'manual') {
        nameY = parseFloat(document.getElementById('manualYInput').value);
        if (isNaN(nameY)) {
            alert('Please enter a valid number for Manual Y coordinate');
            return;
        }
    }

    // Step 4: Get the uploaded PDF template file
    const templateInput = document.getElementById('templateInput');
    const templateFile = templateInput.files[0];
    if (!templateFile) {
        alert('Please select a PDF template file');
        return;
    }

    // Step 5: Load the PDF document into pdf-lib
    const reader = new FileReader();
    reader.onload = async function(event) {
        const existingPdfBytes = new Uint8Array(event.target.result);
        const { PDFDocument, StandardFonts, rgb } = PDFLib;
        const pdfDoc = await PDFDocument.load(existingPdfBytes);

        // Step 6: Get the first page of the document
        const pages = pdfDoc.getPages();
        const firstPage = pages[0];

        // Step 7: Embed the selected font
        const font = await pdfDoc.embedFont(StandardFonts[fontType]);

        // Step 8: Calculate text width and height based on selected font size
        const nameWidth = font.widthOfTextAtSize(name, fontSize);
        const nameHeight = font.heightAtSize(fontSize);

        // Step 9: Calculate text position based on alignment options or manual input
        const pageWidth = firstPage.getWidth();
        const pageHeight = firstPage.getHeight();

        // Calculate X coordinate
        if (typeof nameX === 'number') {
            // Use manual X coordinate
            if (nameX < 0 || nameX > pageWidth) {
                alert('Manual X coordinate is out of bounds');
                return;
            }
        } else if (nameX === 'center') {
            nameX = (pageWidth - nameWidth) / 2;
        } else if (nameX === 'right') {
            nameX = pageWidth - nameWidth - 50; // Adjust as needed for right alignment
        }

        // Calculate Y coordinate
        if (typeof nameY === 'number') {
            // Use manual Y coordinate
            if (nameY < 0 || nameY > pageHeight) {
                alert('Manual Y coordinate is out of bounds');
                return;
            }
        } else if (nameY === 'middle') {
            nameY = (pageHeight - nameHeight) / 2;
        } else if (nameY === 'bottom') {
            nameY = 50; // Adjust as needed for bottom alignment
        }

        // Step 10: Draw text on the first page using calculated coordinates
        firstPage.drawText(name, {
            x: nameX,
            y: nameY,
            size: fontSize,
            font: font,
            color: rgb(0, 0, 0),
        });

        // Step 11: Serialize the PDFDocument to bytes (a Uint8Array)
        const pdfBytes = await pdfDoc.save();

        // Step 12: Create a blob from the pdfBytes
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });

        // Step 13: Create a link element
        const link = document.createElement('a');

        // Step 14: Set the download attribute with a filename
        link.href = URL.createObjectURL(blob);
        link.download = `${name}_certificate.pdf`;

        // Step 15: Append the link to the body
        document.body.appendChild(link);

        // Step 16: Programmatically click the link to trigger the download
        link.click();

        // Step 17: Remove the link from the document
        document.body.removeChild(link);
    };

    reader.readAsArrayBuffer(templateFile);
}
