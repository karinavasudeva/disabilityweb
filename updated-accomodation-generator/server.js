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

function loadAccommodationsFromCSV() {
    const csvPath = path.join(__dirname, 'public', 'accomodations.csv');
    console.log('Attempting to read CSV from:', csvPath);
    fs.createReadStream(csvPath)
        .pipe(csv())  // Remove the separator option as it's comma-separated
        .on('data', (row) => {
            console.log('Raw CSV row:', row);  // Log each row
            const disease = row['disability'];  // Changed from 'Disease' to 'disability'
            const limitation = row['limitation'];  // Changed from 'Limitation' to 'limitation'
            const accommodation = row['accommodation'];  // Changed from 'Accommodation' to 'accommodation'

            console.log('Parsed row:', { disease, limitation, accommodation });  // Log parsed data

            if (!accommodationsData[disease]) {
                accommodationsData[disease] = {};
            }
            if (!accommodationsData[disease][limitation]) {
                accommodationsData[disease][limitation] = [];
            }

            accommodationsData[disease][limitation].push(accommodation);
            diseases.add(disease);
        })
        .on('end', () => {
            console.log('Accommodations data loaded from CSV');
            console.log('Diseases loaded:', Array.from(diseases));
            console.log('Full accommodations data:', JSON.stringify(accommodationsData, null, 2));
        })
        .on('error', (error) => {
            console.error('Error reading CSV file:', error);
        });
}

loadAccommodationsFromCSV();

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/diseases', (req, res) => {
    console.log('Diseases requested. Sending:', Array.from(diseases));
    res.json(Array.from(diseases));
});

app.get('/accommodations', (req, res) => {
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

app.post('/generate-letter', (req, res) => {
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

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});