An intelligent task and content manager powered by the Google Gemini API.**

AI Content Hub is a modern, full-stack application that redefines task management. It goes beyond a simple to-do list by integrating powerful AI features to help you brainstorm ideas, organize your work with natural language, improve your writing, and even gain analytical insights into your projects.

This application is packed with features designed to enhance productivity and creativity:

*   **🧠 Smart Add:** Describe a task in plain English (e.g., _"Review the Q3 report and prepare a presentation by next Friday"_), and the AI will automatically parse it into a structured task with a title, description, subtasks, and relevant tags.

*   **💡 AI-Powered Brainstorming:** Stuck on an idea? Enter a topic, and the AI will generate a list of actionable tasks or creative concepts to get you started.

*   **✍️ Content Weaver:** An AI-powered writing assistant built into the task/note detail view. It can summarize, expand, fix grammar, or change the tone of your text with a single click.

*   **🤝 Collaborative Intelligence Report:** Get a high-level AI analysis of your project hub. The report identifies potential knowledge gaps and suggests related tasks or notes that could be merged, helping to streamline your team's workflow.

<<<<<<< HEAD
*   **✅ Dynamic Task Management:**
    *   Create and manage multiple project lists (Hubs).
    *   Add both tasks and unstructured notes.
    *   Break down complex tasks with subtasks.
    *   Organize and find items easily with #tags.

*   **👥 Multi-User Simulation:** The app is pre-configured with multiple user personas. You can switch between users to see who created which item, simulating a collaborative environment.

*   **🎨 Sleek & Responsive UI:** A beautiful dark-mode interface built with Tailwind CSS that's intuitive, fast, and works great on all screen sizes

This project is a full-stack application with a modern tech stack:

Frontend: A dynamic and responsive UI built with React and TypeScript, styled using Tailwind CSS.
Backend: A REST API powered by Node.js and Express.js, which connects to a MongoDB database for data persistence.
AI Integration: Leverages the Google Gemini API via the @google/genai SDK for all intelligent features like content generation, task parsing, and analysis.
The codebase also includes basic scaffolding for an alternative Angular client.
=======
1. Install dependencies:
   ```bash
   npm install
   cd backend
   npm install
   cd ..
   ```

2. Set up your Gemini API key:
   - Create a `.env.local` file in the root directory
   - Add your API key:
     ```
     VITE_GEMINI_API_KEY=your_gemini_api_key_here
     ```
   - Get your API key from: https://aistudio.google.com/app/apikey

3. Run the app:
   ```bash
   npm run dev:all
   ```
   This will start both the frontend (port 5173) and backend (port 5000).

   Alternatively, run them separately:
   ```bash
   # Terminal 1 - Backend
   npm run start:backend
   
   # Terminal 2 - Frontend
   npm run dev
   ```
>>>>>>> de00583 (Updated files with latest changes)
