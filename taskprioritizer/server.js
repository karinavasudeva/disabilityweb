const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const multer = require('multer');

dotenv.config();

const app = express();
const port = process.env.PORT || 9990;

app.use(bodyParser.json());
app.use(express.static('public'));

const upload = multer({ storage: multer.memoryStorage() });

app.post('/breakdown', async (req, res) => {
    try {
        const { task, spoons, dueDate, recurrence } = req.body;
        if (!task || spoons === undefined || !dueDate) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        const breakdown = await breakdownTask(task, spoons, dueDate, recurrence);
        res.json({ breakdown });
    } catch (error) {
        console.error('An error occurred:', error.message);
        res.status(500).json({ error: 'An error occurred while processing the task', details: error.message });
    }
});

app.post('/prioritize', (req, res) => {
    try {
        const { tasks, spoons } = req.body;
        const prioritizedTasks = prioritizeTasks(tasks, spoons);
        res.json({ prioritizedTasks });
    } catch (error) {
        console.error('An error occurred:', error.message);
        res.status(500).json({ error: 'An error occurred while prioritizing tasks' });
    }
});

app.post('/process-image', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No image file uploaded' });
        }

        const spoons = parseInt(req.body.spoons);
        const imageBase64 = req.file.buffer.toString('base64');
        const tasks = await extractTasksFromImage(imageBase64, spoons);
        res.json({ tasks });
    } catch (error) {
        console.error('An error occurred while processing the image:', error);
        res.status(500).json({ 
            error: 'An error occurred while processing the image', 
            details: error.message,
            stack: error.stack
        });
    }
});

async function breakdownTask(task, spoons, dueDate, recurrence) {
    const apiKey = process.env.OPENAI_API_KEY;
    const url = 'https://api.openai.com/v1/chat/completions';

    const prompt = `Break down the following task into 3-7 subtasks, considering the user has ${spoons} spoons available (based on the Spoon Theory for chronic illness energy management): "${task}". The due date is ${dueDate}. This task ${recurrence ? `recurs ${recurrence}` : 'does not recur'}.

    Guidelines for spoon costs:
    - Very easy tasks: 1-3 spoons
    - Easy tasks: 4-7 spoons
    - Moderate tasks: 8-15 spoons
    - Difficult tasks: 16-25 spoons
    - Very difficult tasks: 26-40 spoons

    Consider that some tasks might take more spoons than the user currently has available, which is okay.

    For the main task and each subtask, provide:
    1. A brief description
    2. Estimated time to complete (in the format "X days and Y hours" or just "Z hours" if less than a day)
    3. Realistic spoon cost (a number based on the guidelines above)

    Format the response as a JSON object with the following structure:
    
    {
      "mainTask": {
        "title": "Main task title",
        "estimatedTime": "X days and Y hours",
        "spoonCost": 20
      },
      "subtasks": [
        {
          "title": "Subtask 1 title",
          "estimatedTime": "Z hours",
          "spoonCost": 5
        },
        ...
      ]
    }`;

    try {
        const response = await axios.post(url, {
            model: "gpt-4-turbo-preview",
            messages: [
                { role: "system", content: "You are a helpful planning assistant that breaks down tasks and estimates time based on available spoons and due dates." },
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
        console.log('Raw API response:', content);

        try {
            let parsedContent = JSON.parse(content);
            // Add the recurrence information to the returned object
            parsedContent.mainTask.recurrence = recurrence || 'none';
            return parsedContent;
        } catch (parseError) {
            console.error('Failed to parse API response as JSON:', parseError);
            const jsonMatch = content.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                let parsedContent = JSON.parse(jsonMatch[0]);
                // Add the recurrence information to the returned object
                parsedContent.mainTask.recurrence = recurrence || 'none';
                return parsedContent;
            } else {
                throw new Error('Unable to extract valid JSON from the API response');
            }
        }
    } catch (error) {
        console.error('Error calling OpenAI API:', error.message);
        if (error.response) {
            console.error('API response status:', error.response.status);
            console.error('API response data:', error.response.data);
        }
        throw new Error('Failed to break down the task: ' + error.message);
    }
}

async function extractTasksFromImage(imageBase64, spoons) {
    const apiKey = process.env.OPENAI_API_KEY;
    const url = 'https://api.openai.com/v1/chat/completions';

    const prompt = `Analyze the image of a task list or agenda. Extract the tasks and break them down into subtasks. Consider the user has ${spoons} spoons available (based on the Spoon Theory for chronic illness energy management).

    Guidelines for spoon costs:
    - Very easy tasks: 1-3 spoons
    - Easy tasks: 4-7 spoons
    - Moderate tasks: 8-15 spoons
    - Difficult tasks: 16-25 spoons
    - Very difficult tasks: 26-40 spoons

    For each task, provide:
    1. A brief description of the main task
    2. 2-3 subtasks
    3. Estimated time to complete for the main task and each subtask (in the format "X days and Y hours" or just "Z hours" if less than a day)
    4. Realistic spoon cost for the main task and each subtask (a number based on the guidelines above)

    Format the response as a JSON array of objects, where each object represents a task with the following structure:
    [
      {
        "mainTask": {
          "title": "Main task title",
          "estimatedTime": "X days and Y hours",
          "spoonCost": 20
        },
        "subtasks": [
          {
            "title": "Subtask 1 title",
            "estimatedTime": "Z hours",
            "spoonCost": 5
          },
          ...
        ]
      },
      ...
    ]`;

    try {
        const response = await axios.post(url, {
            model: "gpt-4-vision-preview",
            messages: [
                {
                    role: "user",
                    content: [
                        { type: "text", text: prompt },
                        { type: "image_url", image_url: { url: `data:image/jpeg;base64,${imageBase64}` } }
                    ]
                }
            ],
            max_tokens: 1000
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            }
        });

        let content = response.data.choices[0].message.content;
        console.log('Raw API response:', content);

        try {
            return JSON.parse(content);
        } catch (parseError) {
            console.error('Failed to parse API response as JSON:', parseError);
            const jsonMatch = content.match(/\[[\s\S]*\]/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            } else {
                throw new Error('Unable to extract valid JSON from the API response');
            }
        }
    } catch (error) {
        console.error('Error calling OpenAI API:', error.message);
        if (error.response) {
            console.error('API response status:', error.response.status);
            console.error('API response data:', error.response.data);
        }
        throw new Error('Failed to extract tasks from image: ' + error.message);
    }
}

function prioritizeTasks(tasks, spoons) {
    return tasks.sort((a, b) => {
        const scoreA = calculateTaskScore(a, spoons);
        const scoreB = calculateTaskScore(b, spoons);
        return scoreB - scoreA;
    });
}

function calculateTaskScore(task, spoons) {
    const spoonMatch = getSpoonMatchScore(task.mainTask.spoonCost, spoons);
    const timeScore = getTimeScore(task.mainTask.estimatedTime);
    const subtaskScore = task.subtasks.reduce((score, subtask) => 
        score + getSpoonMatchScore(subtask.spoonCost, spoons), 0) / task.subtasks.length;

    return spoonMatch + timeScore + subtaskScore;
}

function getSpoonMatchScore(requiredSpoons, availableSpoons) {
    const ratio = availableSpoons / requiredSpoons;
    if (ratio >= 1) {
        return 10; // Task is doable with current spoons
    } else if (ratio > 0.5) {
        return 5; // Task might be doable but challenging
    } else {
        return Math.max(0, 10 * ratio); // Lower score for tasks requiring more spoons than available
    }
}

function getTimeScore(estimatedTime) {
    // Prioritize tasks that can be completed sooner
    const match = estimatedTime.match(/(\d+)\s*days?|(\d+)\s*hours?/);
    if (match) {
        const days = parseInt(match[1]) || 0;
        const hours = parseInt(match[2]) || 0;
        const totalHours = days * 24 + hours;
        return Math.max(10 - Math.log2(totalHours), 1); // Logarithmic scale, capped between 1-10
    }
    return 5; // Default score if parsing fails
}

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});