import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

export const generateOptimizedTimetable = async (tasks) => {
    try {
        const formattedTasks = tasks.map(task => ({
            name: task.TaskName,
            deadline: task.Deadline,
            priority: task.Priority,
            duration: task.Duration
        }));

        const requestBody = {
            contents: [
                {
                    parts: [
                        {
                            text: `Generate an optimized timetable for these tasks: ${JSON.stringify(formattedTasks)}`
                        }
                    ]
                }
            ]
        };

        const response = await axios.post(
            `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
            requestBody,
            {
                headers: {
                    "Content-Type": "application/json"
                }
            }
        );

        if (!response.data || !response.data.candidates || response.data.candidates.length === 0) {
            return null;
        }

        return response.data.candidates[0].content.parts[0].text;
    } catch (error) {
        console.error("❌ AI Schedule Generation Error:", error.response?.data || error.message);
        return null;
    }
};
