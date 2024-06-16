async function generateCertificates() {
    // Step 1: Get the user inputs
    const alignX = document.getElementById('alignX').value;
    const alignY = document.getElementById('alignY').value;
    const manualX = parseFloat(document.getElementById('manualXInput').value);
    const manualY = parseFloat(document.getElementById('manualYInput').value);
    const fontSize = parseFloat(document.getElementById('fontSize').value);
    const fontType = document.getElementById('fontType').value;

    // Step 2: Get the uploaded PDF template file
    const templateInput = document.getElementById('templateInput');
    const templateFile = templateInput.files[0];
    if (!templateFile) {
        alert('Please select a PDF template file');
        return;
    }

    // Step 3: Get the uploaded CSV file
    const csvInput = document.getElementById('csvInput');
    const csvFile = csvInput.files[0];
    if (!csvFile) {
        alert('Please select a CSV file');
        return;
    }

    // Step 4: Read the CSV file
    const reader = new FileReader();
    reader.onload = function(event) {
        const csvData = event.target.result;
        Papa.parse(csvData, {
            header: false,
            complete: async function(results) {
                const names = results.data.map(row => row[0]);
                for (const name of names) {
                    if (name) {
                        await generateCertificate(name, templateFile, alignX, alignY, manualX, manualY, fontSize, fontType);
                    }
                }
            }
        });
    };
    reader.readAsText(csvFile);
}

async function generateCertificate(name, templateFile, alignX, alignY, manualX, manualY, fontSize, fontType) {
    const reader = new FileReader();
    reader.onload = async function(event) {
        const existingPdfBytes = new Uint8Array(event.target.result);
        const { PDFDocument, rgb } = PDFLib;
        const pdfDoc = await PDFDocument.load(existingPdfBytes);

        // Step 1: Get the first page of the document
        const pages = pdfDoc.getPages();
        const firstPage = pages[0];
        const { width: pageWidth, height: pageHeight } = firstPage.getSize();

        // Step 2: Embed the selected font
        const font = await pdfDoc.embedFont(PDFLib.StandardFonts[fontType]);

        // Step 3: Calculate text width and height
        const nameWidth = font.widthOfTextAtSize(name, fontSize);
        const nameHeight = fontSize;

        // Step 4: Calculate X coordinate
        let x;
        if (alignX === 'manual') {
            x = manualX;
        } else if (alignX === 'left') {
            x = 50; // Adjust as needed for left alignment
        } else if (alignX === 'center') {
            x = (pageWidth - nameWidth) / 2;
        } else if (alignX === 'right') {
            x = pageWidth - nameWidth - 50; // Adjust as needed for right alignment
        }

        // Step 5: Calculate Y coordinate
        let y;
        if (alignY === 'manual') {
            y = manualY;
        } else if (alignY === 'top') {
            y = pageHeight - nameHeight - 50; // Adjust as needed for top alignment
        } else if (alignY === 'middle') {
            y = (pageHeight - nameHeight) / 2;
        } else if (alignY === 'bottom') {
            y = 50; // Adjust as needed for bottom alignment
        }

        // Step 6: Draw the name on the first page
        firstPage.drawText(name, {
            x: x,
            y: y,
            size: fontSize,
            font: font,
            color: rgb(0, 0, 0),
        });

        // Step 7: Serialize the PDFDocument to bytes (a Uint8Array)
        const pdfBytes = await pdfDoc.save();

        // Step 8: Create a blob from the pdfBytes
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });

        // Step 9: Create a link element
        const link = document.createElement('a');

        // Step 10: Set the download attribute with a filename
        link.href = URL.createObjectURL(blob);
        link.download = `${name}_certificate.pdf`;

        // Step 11: Append the link to the body
        document.body.appendChild(link);

        // Step 12: Programmatically click the link to trigger the download
        link.click();

        // Step 13: Remove the link from the document
        document.body.removeChild(link);
    };

    reader.readAsArrayBuffer(templateFile);
}

function toggleManualInput(selectId, inputId) {
    const select = document.getElementById(selectId);
    const input = document.getElementById(inputId);
    if (select.value === 'manual') {
        input.style.display = 'block';
    } else {
        input.style.display = 'none';
    }
}
