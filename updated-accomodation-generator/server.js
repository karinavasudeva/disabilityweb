const axios = require('axios'); // Add this line
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
    if (!fs.existsSync(filePath)) return;

    const fileContent = fs.readFileSync(filePath, 'utf8');
    const rows = fileContent.split('\n');
    
    rows.forEach((row, index) => {
        if (index === 0) return;
        const [disability, limitation, accommodation] = row.split(',');
        if (!accommodationsData[disability]) accommodationsData[disability] = {};
        if (!accommodationsData[disability][limitation]) accommodationsData[disability][limitation] = [];
        accommodationsData[disability][limitation].push(accommodation);
        diseases.add(disability);
    });
}

loadAccommodationsFromCSV();

const LLAMA_API_KEY = process.env.LLAMA_API_KEY;

async function getAccommodationsFromLlama(disease) {
    try {
        const response = await axios.post('https://api.llamaapi.com/v1/generate', {
            prompt: `Suggest reasonable accommodations for a person with ${disease}.`,
            max_tokens: 150,
            temperature: 0.7
        }, {
            headers: {
                'Authorization': `Bearer ${LLAMA_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        const suggestions = response.data.choices[0].text.trim().split('\n');
        return suggestions;
    } catch (error) {
        console.error('Error calling Llama API:', error);
        throw new Error('Failed to generate accommodations from Llama');
    }
}

app.get('/api/accommodations', async (req, res) => {
    const disease = req.query.disease;

    if (accommodationsData[disease]) {
        res.json({ accommodations: accommodationsData[disease] });
    } else {
        try {
            const suggestions = await getAccommodationsFromLlama(disease);
            res.json({ accommodations: { 'General Recommendations': suggestions } });
        } catch (error) {
            res.status(500).json({ error: 'Unable to generate accommodations for this disease' });
        }
    }
});

module.exports = app;

if (require.main === module) {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

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
