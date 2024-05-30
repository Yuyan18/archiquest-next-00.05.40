"use client";
import { useState } from "react";
import Link from "next/link";

export default function ExplorationStartPage() {
  const [isMuted, setIsMuted] = useState(true);

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24 relative">
      <video className="absolute top-0 left-0 w-full h-full object-cover z-0" autoPlay loop muted={isMuted}>
        <source src="/19990118.mp4" type="video/mp4" />
      </video>
      <button
        className="absolute top-4 right-4 z-10 bg-white text-black px-2 py-1 rounded-lg"
        onClick={toggleMute}
      >
        {isMuted ? "Unmute" : "Mute"}
      </button>
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
        <div className="flex flex-col">
          <h1 className="text-4xl mb-8 text-white">Stellar Quest</h1>
          <div className="bg-transparent p-6 rounded-lg mb-8">
            <h2 className="text-2xl font-bold mb-4 text-white">Game Objective</h2>
            <p className="mb-4 text-white">
              Explore as many planets as possible, record your adventure history, and uncover the secrets and events of
              different planets.
            </p>
            <h2 className="text-2xl font-bold mb-4 text-white">Game Rules</h2>
            <ol className="list-decimal list-inside mb-4 text-white">
              <li>
                <strong>Starting Point</strong>: Players can choose to start from Luna (the Moon) or the Red Planet
                (Mars).
              </li>
              <li>
                <strong>Fuel Mechanism</strong>:
                <ul className="list-disc list-inside ml-6">
                  <li>At the beginning of the game, players will have 5 units of fuel.</li>
                  <li>Exploring a new planet consumes 1 unit of fuel.</li>
                  <li>Explored planets are recorded in the history log, and revisiting them does not consume fuel.</li>
                </ul>
              </li>
              <li>
                <strong>Exploration and Events</strong>:
                <ul className="list-disc list-inside ml-6">
                  <li>Each time a player explores a new planet, various random events may occur, such as receiving additional fuel.</li>
                  <li>Each planet has its unique scenes. Players can learn more cosmic secrets through exploration and create unique imprints of their own through drawings.</li>
                </ul>
              </li>
              <li>
                <strong>Fuel Depletion</strong>:
                <ul className="list-disc list-inside ml-6">
                  <li>The game ends when the player runs out of fuel.</li>
                  <li>After the game ends, players can review their exploration history.</li>
                </ul>
              </li>
              <li>
                <strong>History Log</strong>:
                <ul className="list-disc list-inside ml-6">
                  <li>Every exploration in the game is recorded in the history log. Even after the game ends, unlocked planets are preserved.</li>
                  <li>Players can review and revisit previously explored planets in future games without consuming fuel.</li>
                </ul>
              </li>
            </ol>
          </div>
          <Link href="/exploration">
            <div className="bg-grey text-black px-4 py-2 rounded-lg cursor-pointer inline-flex items-center">
              <img src="/19990928.gif" alt="Start Exploration" className="w-62 h-62 mr-4" />
            </div>
          </Link>
        </div>
      </div>
    </main>
  );
}