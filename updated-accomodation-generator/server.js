console.log('Server starting - version 2');  // Add this line at the top
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();

app.use(bodyParser.json());
app.use(express.static('public'));

let accommodationsData = {};
let diseases = new Set();

function loadAccommodationsFromCSV() {
    const filePath = path.join(__dirname, 'public', 'accommodations.csv');
    console.log('Attempting to read CSV file from:', filePath);

    if (!fs.existsSync(filePath)) {
        console.error(`Error: File does not exist at ${filePath}`);
        return;
    }

    try {
        const fileContent = fs.readFileSync(filePath, 'utf8');
        console.log('File content length:', fileContent.length);
        console.log('First 200 characters of file:', fileContent.substring(0, 200));
        
        const rows = fileContent.split('\n').map(row => row.trim()).filter(row => row);
        console.log('Number of rows:', rows.length);
        
        rows.forEach((row, index) => {
            if (index === 0) {
                console.log('Header row:', row);
                return; // Skip header row
            }
            // Split by comma, but allow for quotes to enclose fields with commas
            const parts = row.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g);
            if (!parts || parts.length < 3) {
                console.log(`Skipping row ${index} due to incorrect format:`, row);
                return;
            }
            
            const [disability, limitation, accommodation] = parts.map(part => part.replace(/^"|"$/g, '').trim());
            
            if (disability && limitation && accommodation) {
                if (!accommodationsData[disability]) {
                    accommodationsData[disability] = {};
                }
                if (!accommodationsData[disability][limitation]) {
                    accommodationsData[disability][limitation] = [];
                }
                accommodationsData[disability][limitation].push(accommodation);
                diseases.add(disability);
                console.log(`Added: Disability: ${disability}, Limitation: ${limitation}, Accommodation: ${accommodation}`);
            } else {
                console.log(`Skipping row ${index} due to missing data:`, row);
            }
        });

        console.log('CSV processing complete');
        console.log('Number of diseases loaded:', diseases.size);
        console.log('Diseases:', Array.from(diseases));
    } catch (error) {
        console.error('Error reading or parsing CSV file:', error);
        console.error('Error stack:', error.stack);
    }
}

loadAccommodationsFromCSV();

app.get('/diseases', (req, res) => {
    console.log('Received request for diseases');
    console.log('Number of diseases:', diseases.size);
    console.log('Diseases:', Array.from(diseases));
    res.json(Array.from(diseases));
});

app.get('/accommodations', (req, res) => {
    const disease = req.query.disease;
    console.log('Received request for accommodations for disease:', disease);
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

module.exports = app;

if (require.main === module) {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
        console.log('Current working directory:', process.cwd());
    });
}
