"use client";

import { getGroqCompletion } from "@/ai/groq";
import { useState } from "react";

export default function QuestionAnswer() {
  const [question, setQuestion] = useState<string>("");
  const [answer, setAnswer] = useState<string>("");
  const [response, setResponse] = useState<string>("");

  const createQuestion = async () => {
    //get groq to generate a theme for our question
    const theme = await getGroqCompletion(
      "Generate a theme for a gameshow question",
      100,
      ""
    );
    //get groq to generate a type of gameshow question
    const type = await getGroqCompletion(
      `The theme of a gameshow is ${theme}. Generate an engaging and interesting type of question for players to answer. 
      Don't generate the question yet, just think of a general type.`,
      100,
      ""
    );
    //get groq to generate a question
    const generatedQuestion = await getGroqCompletion(
      `The theme of a gameshow is ${theme}. The type of the question is ${type}. Generate a gameshow question for the players to answer.`,
      100,
      ""
    );

    //save that in state so that we can display it to the user
    setQuestion(generatedQuestion);
  };

  const submitAnswer = async () => {
    //send groq our answer, see if its correct, and get a score
    const answerCorrent = await getGroqCompletion(
      `The question was ${question}. The player's answer is ${answer}. Is the answer correct? If so, what is the score?`,
      100,
      ""
    );

    setResponse(answerCorrent);
  };

  return (
    <div className="flex flex-col w-full gap-4">
      <button onClick={createQuestion}>Create Question</button>
      <p>{question}</p>
      <input onChange={(e) => setAnswer(e.target.value)}></input>
      <button onClick={submitAnswer}>Submit Answer</button>
      <p>{response}</p>
    </div>
  );
}
