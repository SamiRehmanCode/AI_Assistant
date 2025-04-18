
# AI Assistant

AI Assistant is a web-based chat application that allows users to interact with AI models like OpenAI's GPT. It provides a clean and intuitive interface for managing chat sessions, switching between AI models, and sending messages.

## Features

- **Chat Sessions**: Create, manage, and delete chat sessions.
- **AI Models**: Switch between different AI models (e.g., GPT-3.5-turbo).
- **Real-Time Responses**: Get AI-generated responses in real-time.
- **Sidebar Navigation**: Toggle a sidebar to view and manage chat sessions.
- **Customizable Prompts**: Send custom user inputs to the AI.

## Project Structure

```
.env
.gitignore
components.json
next-env.d.ts
next.config.mjs
package.json
pnpm-lock.yaml
postcss.config.mjs
tailwind.config.ts
tsconfig.json
.next/
app/
components/
hooks/
lib/
public/
styles/
types/
```

### Key Files

- **`hooks/use-chat-store.ts`**: Contains the main logic for managing chat sessions and interacting with the AI.
- **`lib/chat-utils.ts`**: Utility functions for creating chat sessions and messages.
- **`components/`**: Reusable UI components like `chat-input`, `chat-history`, and `bot-selector`.

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/SamiRehmanCode/AI_Assistant.git
   cd AI_Assistant
   ```

2. Install dependencies:

   ```bash
   pnpm install
   ```

3. Create a `.env` file in the root directory and add your OpenAI API key:

   ```env
   OPENAI_API_KEY=your-openai-api-key
   ```

4. Start the development server:

   ```bash
   pnpm dev
   ```

5. Open the app in your browser at `http://localhost:3000`.

## Usage

1. Open the app in your browser.
2. Create a new chat session or select an existing one from the sidebar.
3. Type your message in the input box and press Enter to send it.
4. Switch between AI models using the model selector.

## Environment Variables

The following environment variables are required:

- `OPENAI_API_KEY`: Your OpenAI API key for accessing GPT models.

## Scripts

- `pnpm dev`: Start the development server.
- `pnpm build`: Build the project for production.
- `pnpm start`: Start the production server.
- `pnpm lint`: Run linting checks.

## Technologies Used

- **Next.js**: Framework for building the application.
- **React**: Frontend library for building UI components.
- **Tailwind CSS**: Utility-first CSS framework for styling.
- **OpenAI API**: For AI-generated responses.

## Security

This project uses OpenAI's API key for accessing GPT models. Ensure that your API key is kept secure and not exposed in the client-side code. Use environment variables to manage sensitive information.

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository.
2. Create a new branch for your feature or bug fix.
3. Commit your changes and push them to your fork.
4. Submit a pull request.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

**Note**: If you accidentally exposed your OpenAI API key, make sure to revoke it immediately and replace it with a new one.
```
