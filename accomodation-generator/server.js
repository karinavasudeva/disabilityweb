const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static('public'));

app.post('/generate-letter', async (req, res) => {
  try {
    const { name, disability, context } = req.body;
    if (!name || !disability || !context) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ error: 'OpenAI API key is not set' });
    }
    
    const accommodations = await generateAccommodations(disability, context);
    const letter = generateAccommodationLetter(name, disability, accommodations, context);
    res.json({ letter, accommodations });
  } catch (error) {
    console.error('An error occurred:', error);
    res.status(500).json({ 
      error: 'An error occurred', 
      details: error.message,
      stack: process.env.NODE_ENV === 'production' ? '🥞' : error.stack
    });
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
    console.log('Raw API response:', content);

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
      
      const suggestions = content.split('\n').filter(line => line.trim().startsWith('-') || line.trim().startsWith('*') || line.trim().startsWith('"'));
      if (suggestions.length > 0) {
        return suggestions.map(suggestion => suggestion.replace(/^[-*"]\s*/, '').replace(/[",]$/g, '').trim());
      } else {
        return ['Error: Unable to parse API response'];
      }
    }
  } catch (error) {
    console.error('Error calling OpenAI API:', error.response ? error.response.data : error.message);
    throw new Error('Error generating accommodations: ' + (error.response ? JSON.stringify(error.response.data) : error.message));
  }
}

function generateAccommodationLetter(name, disability, accommodations, context) {
  const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  
  return `
${date}

To Whom It May Concern:

Re: Accommodation Request for ${name}

I am writing this letter to formally request accommodations for ${name}, who has been diagnosed with ${disability}. ${name} is a valued ${context} who requires certain accommodations to ensure equal access and opportunity in their ${context} environment.

Based on ${name}'s condition and needs, the following accommodations are recommended:

${accommodations.map((acc, index) => `${index + 1}. ${acc}`).join('\n')}

These accommodations are essential to help ${name} fully participate and succeed in their ${context} responsibilities. We kindly request your understanding and cooperation in implementing these accommodations as appropriate.

It's important to note that this list is not exhaustive, and the specific accommodations should be discussed and tailored to ${name}'s individual needs and circumstances. We encourage open communication to ensure that ${name}'s needs are met effectively.

If you require any additional information or have any questions regarding these accommodations, please don't hesitate to contact us. We are happy to provide further clarification or documentation as needed.

Thank you for your attention to this matter and your commitment to providing an inclusive environment for all.

Sincerely,

[Your Name]
[Your Title/Position]
[Your Institution/Organization]
[Contact Information]
`.trim();
}

module.exports = app;
