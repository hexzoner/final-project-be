import OpenAI from 'openai';
import OpenAIMock from '../utils/OpenAiMock.js';
import asyncHandler from '../utils/asyncHandler.js';
import dotenv from 'dotenv';

dotenv.config();

export const createChat = asyncHandler(async (req, res) => {
  const {
    body: { stream, ...request },
    headers: { mode }
  } = req;

  let openai;

  mode === 'production'
    ? (openai = new OpenAI())
    : (openai = new OpenAIMock());

  const completion = await openai.chat.completions.create({
    stream,
    ...request
  });

  if (stream) {
    res.writeHead(200, {
      Connection: 'keep-alive',
      'Cache-Control': 'no-cache',
      'Content-Type': 'text/event-stream'
    });
    for await (const chunk of completion) {
      res.write(`data: ${JSON.stringify(chunk)}\n\n`);
    }
    res.end();
    res.on('close', () => res.end());
  } else {
    res.json(completion.choices[0]);
  }
});