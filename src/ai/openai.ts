"use server";
import OpenAI from "openai";
import { LLMRequest } from "./types";

const openai_key = process.env.OPENAI;

const openai = new OpenAI({
  apiKey: openai_key,
});

//We can call the Groq API and pass our user prompt, max tokens and system prompt.
export async function getOpenAICompletion(
  userPrompt: string,
  max_tokens: number,
  systemPrompt: string = "",
  jsonOnly: boolean = false
) {
  const body = {
    messages: [
      { role: "system", content: systemPrompt },
      {
        role: "user",
        content: userPrompt,
      },
    ],
    model: "gpt-4o",
    max_tokens: max_tokens,
  } as LLMRequest;
  if (jsonOnly) body.response_format = { type: "json_object" };

  const completion = await openai.chat.completions.create(body);
  return (
    completion.choices[0]?.message?.content || "Oops, something went wrong."
  );
}
