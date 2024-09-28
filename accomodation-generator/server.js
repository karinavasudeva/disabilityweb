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
    const filePath = path.join(__dirname, 'public', 'accommodations.csv');
    
    fs.createReadStream(filePath)
        .pipe(csv({ separator: '\t' }))
        .on('data', (row) => {
            const disease = row['Disease'];
            const limitation = row['Limitation'];
            const accommodation = row['Accommodation'];

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
        });
}

loadAccommodationsFromCSV();

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/diseases', (req, res) => {
    res.json(Array.from(diseases));
});

app.get('/accommodations', (req, res) => {
    const disease = req.query.disease;
    if (accommodationsData[disease]) {
        res.json({ accommodations: accommodationsData[disease] });
    } else {
        res.status(404).json({ error: 'No accommodations found for this disease' });
    }
});

app.post('/generate-letter', (req, res) => {
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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
