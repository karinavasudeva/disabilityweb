const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const axios = require('axios');

dotenv.config();

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static('public'));

console.log('OPENAI_API_KEY:', process.env.OPENAI_API_KEY ? 'Is set' : 'Is not set');

// Check if OpenAI API key is set
if (!process.env.OPENAI_API_KEY) {
  console.error('OPENAI_API_KEY is not set in the environment variables.');
  process.exit(1);
}

app.post('/generate-letter', async (req, res) => {
  try {
    const { name, disability, context } = req.body;
    if (!name || !disability || !context) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const accommodations = await generateAccommodations(disability, context);
    const letter = generateAccommodationLetter(name, disability, accommodations, context);
    res.json({ letter, accommodations });
  } catch (error) {
    console.error('An error occurred:', error);
    res.status(500).json({ error: 'An error occurred', details: error.message });
  }
});

async function generateAccommodations(disability, context) {
  const openaiApiKey = process.env.OPENAI_API_KEY;
  const url = 'https://api.openai.com/v1/chat/completions';
  
  const prompt = `Given a person with the following disability: "${disability}" in a ${context} context, suggest 5 appropriate accommodations. Provide your response as a JSON array of strings.`;

  try {
    const response = await axios.post(url, {
      model: "gpt-3.5-turbo",
      messages: [
        {role: "system", content: "You are a helpful assistant that suggests accommodations for people with disabilities."},
        {role: "user", content: prompt}
      ],
      temperature: 0.7,
      max_tokens: 200
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiApiKey}`
      }
    });

    let content = response.data.choices[0].message.content;
    console.log('Raw API response:', content);  // Log the raw response

    // Remove Markdown code block syntax if present
    content = content.replace(/```json\n?|\n?```/g, '').trim();

    try {
      const suggestedAccommodations = JSON.parse(content);
      if (Array.isArray(suggestedAccommodations)) {
        return suggestedAccommodations;
      } else {
        console.error('API response is not an array:', suggestedAccommodations);
        return ['Error: Unexpected response format from API'];
      }
    } catch (parseError) {
      console.error('Error parsing JSON:', parseError);
      console.error('Processed content:', content);
      
      // Attempt to extract suggestions if JSON parsing fails
      const suggestions = content.split('\n').filter(line => line.trim().startsWith('-') || line.trim().startsWith('*') || line.trim().startsWith('"'));
      if (suggestions.length > 0) {
        return suggestions.map(suggestion => suggestion.replace(/^[-*"]\s*/, '').replace(/[",]$/g, '').trim());
      } else {
        return ['Error: Unable to parse API response'];
      }
    }
  } catch (error) {
    console.error('Error calling OpenAI API:', error.response ? error.response.data : error.message);
    return ['Error generating accommodations. Please try again.'];
  }
}

function generateAccommodationLetter(name, disability, accommodations, context) {
  const date = new Date().toLocaleDateString();
  return `
Date: ${date}

To Whom It May Concern:

I am writing this letter on behalf of ${name}, who has been diagnosed with ${disability}. ${name} is a valued ${context} who requires certain accommodations to ensure equal access and opportunity.

Based on ${name}'s condition, the following accommodations are suggested:

${accommodations.map(acc => `- ${acc}`).join('\n')}

These accommodations are recommended to help ${name} fully participate and succeed in their ${context} environment. We kindly request your understanding and cooperation in implementing these accommodations as appropriate.

Please note that this list is not exhaustive, and the specific accommodations should be discussed and tailored to ${name}'s individual needs and circumstances.

If you have any questions or need further information, please don't hesitate to contact us.

Thank you for your attention to this matter.

Sincerely,
[Your Name/Institution]
  `.trim();
}

function startServer(port) {
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  }).on('error', (e) => {
    if (e.code === 'EADDRINUSE') {
      console.log(`Port ${port} is already in use. Trying the next port...`);
      startServer(port + 1);
    } else {
      console.error('An error occurred:', e);
    }
  });
}

// Start the server on port 3000, or the next available port
startServer(3001);