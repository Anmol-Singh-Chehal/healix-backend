import fs from "fs";
import csv from "csv-parser";

const results = [];

fs.createReadStream("./model/data.csv")   // ← Correct path
  .pipe(csv())
  .on("data", (row) => {
    results.push({
      disease: row.Disease,
      symptoms: JSON.parse(row.Symptoms.replace(/'/g, '"')),
      medicines: JSON.parse(row.Medicine.replace(/'/g, '"'))
    });
  })
  .on("end", () => {
    const jsContent = `export const dataset = ${JSON.stringify(results, null, 2)};`;
    fs.writeFileSync("./model/dataset.js", jsContent);

    console.log("✔ dataset.js file created successfully!");
  });
