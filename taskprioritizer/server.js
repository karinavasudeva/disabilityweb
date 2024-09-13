const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const port = process.env.PORT || 9990;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static('public'));

let allTasks = [];

app.post('/breakdown', async (req, res) => {
  try {
    const { task, energyLevel } = req.body;
    const breakdown = await breakdownTask(task, energyLevel);
    allTasks.push({ task, subtasks: breakdown });
    const prioritizedTasks = prioritizeAllTasks(energyLevel);
    res.json({ breakdown: prioritizedTasks });
  } catch (error) {
    console.error('An error occurred:', error.message);
    res.status(500).json({ error: 'An error occurred while processing the task' });
  }
});

async function breakdownTask(task, energyLevel) {
  const apiKey = process.env.OPENAI_API_KEY;
  const url = 'https://api.openai.com/v1/chat/completions';

  const prompt = `Given the task "${task}" and the user's current energy level of ${energyLevel} out of 10, break this task down into 3-5 subtasks. For each subtask, provide:
  1. A brief description
  2. Estimated time to complete (in minutes)
  3. Importance (high or low)
  4. Urgency (high or low)

  Consider the energy level when determining importance and urgency.
  
  Format each subtask on a new line, starting with a dash (-). Ensure each piece of information is on its own line and clearly labeled.`;

  try {
    const response = await axios.post(url, {
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are a helpful assistant that breaks down tasks and prioritizes them based on energy levels." },
        { role: "user", content: prompt }
      ],
      temperature: 0.7
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      }
    });

    let content = response.data.choices[0].message.content;
    
    console.log('Raw OpenAI response:', content);

    // Parse the text response into structured data
    const subtasks = parseTextResponse(content, task);
    
    console.log('Parsed subtasks:', JSON.stringify(subtasks, null, 2));

    return subtasks;
  } catch (error) {
    console.error('Error calling OpenAI API:', error.message);
    throw new Error('Failed to break down the task');
  }
}

function parseTextResponse(text, mainTask) {
  if (typeof text !== 'string') {
      console.error('Unexpected response format:', text);
      return [];
  }

  const subtasks = [];
  let currentSubtask = null;

  text.split('\n').forEach(line => {
      line = line.trim();
      if (line.startsWith('-')) {
          if (currentSubtask) subtasks.push(currentSubtask);
          currentSubtask = { description: line.slice(1).trim(), mainTask };
      } else if (currentSubtask) {
          const lowerLine = line.toLowerCase();
          if (lowerLine.includes('estimated time:')) {
              currentSubtask.estimated_time = line.split(':')[1].trim();
          } else if (lowerLine.includes('importance:')) {
              currentSubtask.importance = line.split(':')[1].trim().toLowerCase();
          } else if (lowerLine.includes('urgency:')) {
              currentSubtask.urgency = line.split(':')[1].trim().toLowerCase();
          }
      }
  });

  if (currentSubtask) subtasks.push(currentSubtask);

  // Filter out invalid subtasks (those missing key information)
  return subtasks.filter(subtask =>
      subtask.description && 
      subtask.estimated_time && 
      subtask.importance && 
      subtask.urgency
  );
}

function prioritizeAllTasks(energyLevel) {
  const flattenedTasks = allTasks.flatMap(taskGroup => 
      taskGroup.subtasks.map(subtask => ({
          ...subtask,
          mainTask: taskGroup.task
      }))
  );

  return flattenedTasks.sort((a, b) => {
      // Define quadrant priorities
      const quadrantOrder = {
          'do': 4, // High importance, high urgency
          'decide': 3, // High importance, low urgency
          'delegate': 2, // Low importance, high urgency
          'delete': 1 // Low importance, low urgency
      };

      const quadrantA = getQuadrant(a.importance, a.urgency);
      const quadrantB = getQuadrant(b.importance, b.urgency);

      // Prioritize by quadrant first
      if (quadrantOrder[quadrantA] !== quadrantOrder[quadrantB]) {
          return quadrantOrder[quadrantB] - quadrantOrder[quadrantA];
      }

      // If quadrants are the same, prioritize by estimated time and energy level
      const timeA = parseInt(a.estimated_time);
      const timeB = parseInt(b.estimated_time);

      if (energyLevel <= 3) {
          // Prefer shorter tasks for low energy
          return timeA - timeB;
      } else if (energyLevel >= 8) {
          // Prefer longer tasks for high energy
          return timeB - timeA;
      }
      // For medium energy, keep the original order
      return 0;
  });
}

function getQuadrant(importance, urgency) {
  if (importance === 'high' && urgency === 'high') return 'do';
  if (importance === 'high' && urgency === 'low') return 'decide';
  if (importance === 'low' && urgency === 'high') return 'delegate';
  return 'delete';
}

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

app.post('/breakdown', async (req, res) => {
  try {
    const { task, energyLevel } = req.body;
    if (!task || typeof energyLevel !== 'number') {
      return res.status(400).json({ error: 'Invalid task or energy level' });
    }

    const breakdown = await breakdownTask(task, energyLevel);
    if (!breakdown || breakdown.length === 0) {
      throw new Error('Failed to parse subtasks');
    }

    allTasks.push({ task, subtasks: breakdown });
    const prioritizedTasks = prioritizeAllTasks(energyLevel);
    res.json({ breakdown: prioritizedTasks });
  } catch (error) {
    console.error('An error occurred:', error.message);
    res.status(500).json({ error: 'An error occurred while processing the task' });
  }
});

