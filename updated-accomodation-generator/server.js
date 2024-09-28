const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');

const app = express();

app.use(bodyParser.json());
app.use(express.static('public'));

let accommodationsData = {};
let diseases = new Set();

// Load CSV data synchronously at startup
function loadAccommodationsFromCSV() {
    const filePath = path.join(__dirname, 'public', 'accommodations.csv');
    console.log('Attempting to read CSV file from:', filePath);

    if (!fs.existsSync(filePath)) {
        console.error(`Error: File does not exist at ${filePath}`);
        return;
    }

    const fileContent = fs.readFileSync(filePath, 'utf8');
    const rows = fileContent.split('\n');
    
    rows.forEach((row, index) => {
        if (index === 0) return; // Skip header row
        const [disability, limitation, accommodation] = row.split(',');
        if (!accommodationsData[disability]) {
            accommodationsData[disability] = {};
        }
        if (!accommodationsData[disability][limitation]) {
            accommodationsData[disability][limitation] = [];
        }
        accommodationsData[disability][limitation].push(accommodation);
        diseases.add(disability);
    });

    console.log('Accommodations data loaded successfully from CSV');
    console.log('Diseases loaded:', Array.from(diseases));
}

// Load data immediately
loadAccommodationsFromCSV();

app.get('/api/diseases', (req, res) => {
    res.json(Array.from(diseases));
});

app.get('/api/accommodations', (req, res) => {
    const disease = req.query.disease;
    if (accommodationsData[disease]) {
        res.json({ accommodations: accommodationsData[disease] });
    } else {
        res.status(404).json({ error: 'No accommodations found for this disease' });
    }
});

app.post('/api/generate-letter', (req, res) => {
    const { name, disability, context, accommodations } = req.body;
    const letter = generateAccommodationLetter(name, disability, accommodations, context);
    res.json({ letter });
});

function generateAccommodationLetter(name, disability, accommodations, context) {
    const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const accommodationsList = accommodations.map((acc, index) => `${index + 1}. ${acc}`).join('\n');

    return `
${date}

To Whom It May Concern,

Re: Accommodation Request for ${name}

I am writing to formally request accommodations for ${name}, who has been diagnosed with ${disability}. ${name} is a valued ${context} who requires certain accommodations to ensure equal access and opportunity in their ${context} environment.

Based on ${name}'s condition, the following accommodations are recommended:

${accommodationsList}

These accommodations are essential to help ${name} fully participate in their responsibilities. We kindly request your cooperation in implementing these accommodations.

Thank you for your attention.

Sincerely,

[Your Name]
[Your Title/Position]
[Your Institution/Organization]
[Contact Information]
    `.trim();
}

module.exports = app;

// Only start the server if this file is run directly
if (require.main === module) {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
        console.log('Current working directory:', process.cwd());
    });
}
