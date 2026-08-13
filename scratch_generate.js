const { jsPDF } = require("jspdf");
const fs = require("fs");
const path = require("path");

const doc = new jsPDF();

// Page 1
doc.text("Page 1 - Introduction to PDF Splitter test document.", 10, 10);

// Page 2
doc.addPage();
doc.text("Page 2 - This is the second page of our split test.", 10, 10);

// Page 3
doc.addPage();
doc.text("Page 3 - Middle page containing some figures and data.", 10, 10);

// Page 4
doc.addPage();
doc.text("Page 4 - Fourth page for range splitting testing.", 10, 10);

// Page 5
doc.addPage();
doc.text("Page 5 - Conclusion and end of test document.", 10, 10);

// Save to file
const outputPath = path.join(__dirname, "sample.pdf");
const buffer = doc.output("arraybuffer");
fs.writeFileSync(outputPath, Buffer.from(buffer));

console.log("Sample PDF successfully created at:", outputPath);
