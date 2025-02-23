import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

export const generateOptimizedTimetable = async (tasks) => {
    try {
        const formattedTasks = tasks.map((task) => ({
            name: task.TaskName,
            deadline: task.Deadline,
            priority: task.Priority,
            duration: task.Duration,
        }));

        const requestBody = {
            contents: [
                {
                    parts: [
                        {
                            text: `Generate a structured timetable where tasks are scheduled **before their deadline** based on their priority and duration.

## **Rules for Scheduling**:
- **Tasks must start and end before the deadline**.
- **Higher priority tasks** should be scheduled **earlier**.
- Avoid overlapping tasks.
-make sure to have breaks of 30 minutes if more than one task is present on same date.
- Use the following format:

The output **must** strictly follow this format:

{
  "timetable": [
    {
      "TaskName": "",
      "StartTime": "",
      "EndTime": "",
      "Duration": "",
      "Date": "",
      "Priority": ""
    },
    {
      "TaskName": "",
      "StartTime": "",
      "EndTime": "",
      "Duration": "",
      "Date": "",
      "Priority": ""
    }
  ]
}

Tasks to schedule: ${JSON.stringify(formattedTasks, null, 2)}

DO NOT include any markdown, text explanations, or formatting outside the JSON object.
ONLY return a valid JSON object as the output.
`
                        },
                    ],
                },
            ],
        };

        const response = await axios.post(
            `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
            requestBody,
            {
                headers: {
                    "Content-Type": "application/json",
                },
            }
        );

        if (!response.data || !response.data.candidates || response.data.candidates.length === 0) {
            console.error("AI Response Error: No candidates returned", response.data);
            return null;
        }

        const candidate = response.data.candidates[0];
        if (!candidate.content || !candidate.content.parts || candidate.content.parts.length === 0) {
            console.error("AI Response Error: No content parts found", candidate);
            return null;
        }

        const aiResponse = candidate.content.parts[0].text;

        try {
            const parsedTimetable = JSON.parse(aiResponse);
            return parsedTimetable; 
        } catch (parseError) {
            console.error("Failed to parse AI response:", parseError, "\nResponse:", aiResponse);
            return { error: "AI returned an invalid format", rawResponse: aiResponse };
        }

    } catch (error) {
        console.error("AI Schedule Generation Error:", error.response?.data || error.message);
        return null;
    }
};

