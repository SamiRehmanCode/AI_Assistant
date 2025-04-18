const { OpenAI } = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function chatWithGPT(input: any) {
  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content: "Only respond briefly. Be cost-efficient.",
      },
      {
        role: "user",
        content: input,
      },
    ],
    max_tokens: 50, // ⬅️ Lower this to reduce output token cost
    temperature: 0.5, // ⬅️ Lower creativity = shorter & more consistent responses
    top_p: 0.7, // ⬅️ Slightly narrows the output range
    frequency_penalty: 0.2, // ⬅️ Avoids repeating tokens
    presence_penalty: 0, // ⬅️ Keeps output tight
  });

  console.log(response.choices[0].message.content);
  return response.choices[0].message.content;
}

//chatWithGPT();
