const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs').promises;
const path = require('path');

const app = express();

app.use(bodyParser.json());
app.use(express.static('public'));

let accommodationsData = {};
let diseases = new Set();

async function loadAccommodationsFromCSV() {
    const csvPath = path.join(process.cwd(), 'accomodations.csv');
    console.log('Attempting to read CSV from:', csvPath);

    try {
        const fileContent = await fs.readFile(csvPath, 'utf8');
        const rows = fileContent.split('\n');
        
        rows.forEach((row, index) => {
            if (index === 0) return; // Skip header row
            const [disability, limitation, accommodation] = row.split(',');
            
            if (disability && limitation && accommodation) {
                if (!accommodationsData[disability]) {
                    accommodationsData[disability] = {};
                }
                if (!accommodationsData[disability][limitation]) {
                    accommodationsData[disability][limitation] = [];
                }
                accommodationsData[disability][limitation].push(accommodation);
                diseases.add(disability);
            }
        });

        console.log('Accommodations data loaded from CSV');
        console.log('Diseases loaded:', Array.from(diseases));
    } catch (error) {
        console.error('Error reading CSV file:', error);
    }
}

app.get('/api/diseases', async (req, res) => {
    if (diseases.size === 0) {
        await loadAccommodationsFromCSV();
    }
    console.log('Diseases requested. Sending:', Array.from(diseases));
    res.json(Array.from(diseases));
});

app.get('/api/accommodations', async (req, res) => {
    if (diseases.size === 0) {
        await loadAccommodationsFromCSV();
    }
    const disease = req.query.disease;
    console.log('Accommodations requested for disease:', disease);
    if (accommodationsData[disease]) {
        console.log('Accommodations found:', accommodationsData[disease]);
        res.json({ accommodations: accommodationsData[disease] });
    } else {
        console.log('No accommodations found for disease:', disease);
        res.status(404).json({ error: 'No accommodations found for this disease' });
    }
});

app.post('/api/generate-letter', (req, res) => {
    const { name, disability, context, accommodations } = req.body;
    console.log('Generating letter for:', { name, disability, context, accommodations });

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
