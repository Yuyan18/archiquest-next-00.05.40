"use client";
import { getGroqCompletion } from "@/ai/groq";
import Agents from "@/components/Agents";
import { useEffect, useState } from "react";
import Animation from "@/components/Animation";
import { describeImagePrompt } from "@/ai/prompts";
import TextToSpeech from "@/components/TextToSpeech";

//Anything you want in your scenario to track over time goes here
//This should really be things like current challenges, disasters, successes, design issues etc
const initResources = {
  land: "2000 acres",
  owner: "Oregon State",
  use: "Forestry",
  marketDemand: "",
  environmentalImpact: "",
  revenue: "",
};
const initAgents = [
  {
    goal: "increase market demand for timber while maintaining environmental awareness",
    plan: "",
    currentTask: "",
    resourcesRequired: "",
  },
  {
    goal: "increase revenue and decrease environmental awareness",
    plan: "",
    currentTask: "",
    resourcesRequired: "",
  },
  {
    goal: "reduce environmental impact and market demand for timber",
    plan: "",
    currentTask: "",
    resourcesRequired: "",
  },
];

//Demo of running multiple agents that all compete for resources
export default function AgentsPage() {
  const [resources, setResources] = useState<any>(initResources);
  const [agents, setAgents] = useState<string[]>(
    initAgents.map((a) => JSON.stringify(a))
  );
  const [worldDescription, setWorldDescription] = useState<string>("");

  useEffect(() => {
    //create our documentary synopsis
    const createSynopsis = async () => {
      const synopsis = await getGroqCompletion(
        "A documentary about the impact of deforestation on the environment",
        256,
        "You are provided with a prompt to write a short synopsis for a documentary film. Avoid flowerly language and hyperbole. "
      );
      setWorldDescription(synopsis);
    };
    createSynopsis();
  }, []);

  const handleResponse = async (newResources: any, newAgents: any[]) => {
    //update the resources based on the new agents
    const description = await getGroqCompletion(
      `World State: ${newResources}. Agents: ${newAgents}`,
      128,
      "You are provided with a world state and an array of agents performing tasks to make changes to this world state. Write a short synopsis for a documentary film summarizing what has happened. Avoid flowerly language and hyperbole. "
    );

    setWorldDescription(description);
    //update resources and agents
    setResources(newResources);
    setAgents(newAgents);
  };

  return (
    <main className="flex min-h-screen flex-col items-end justify-between p-24">
      <div className="z-10 max-w-lg w-full items-center justify-between font-mono text-sm lg:flex">
        <div className="flex flex-col w-full">
          <div>
            {Object.keys(resources).map((key) => (
              <div className="flex justify-between" key={key}>
                <span className="font-semibold">{key}: </span>
                <span>{resources[key]}</span>
              </div>
            ))}
          </div>
          <div>{worldDescription}</div>
          {worldDescription !== "" && (
            <>
              <Animation
                prompt={`${worldDescription}`}
                systemPrompt={describeImagePrompt}
                imageSize="landscape_16_9"
                animate={5000}
                fullscreen={true}
              />
              <TextToSpeech text={worldDescription} autoPlay showControls />
            </>
          )}
          <Agents
            initResources={resources}
            initAgents={agents}
            maxTokens={128}
            handleResponse={handleResponse}
          />
        </div>
      </div>
    </main>
  );
}
