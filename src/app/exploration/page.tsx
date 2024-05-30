"use client";

import ZoomablePannableCanvas, { MapNode } from "@/components/Chart";
import {
  getConnectedLocations,
  getLastMapCoordinate,
  saveConnections,
  saveMapCoordinates,
  setVisited,
} from "./supabaseMaps";
import { useEffect, useState } from "react";
import { getGroqCompletionParallel } from "@/ai/groq";
import SketchToImage from "@/components/SketchToImage";
import BlendImage from "@/components/BlendImage";
import { generateImageFal } from "@/ai/fal";
import { useRouter } from "next/navigation";

//Demo of generating a map of coordinates that can be selected

export default function ExplorationPage() {
  const [selectedLocation, setSelectedLocation] = useState<MapNode | null>(
    null
  );
  const [locations, setLocations] = useState<MapNode[]>([]);
  const [imageUrl, setImageUrl] = useState<string>("");
  const [showSketch, setShowSketch] = useState<boolean>(false);
  const [planetView, setPlanetView] = useState<boolean>(false);
  const [fuel, setFuel] = useState<number>(5);
  const router = useRouter();

  const scale = 100;

  useEffect(() => {
    //use the last created location as a starting coordinate
    const getMap = async () => {
      const start = await getLastMapCoordinate();
      if (!start) return;

      //now go get all connections for this location and build up a graph
      const connections = await getConnectedLocations(start.id, false);
      if (!connections) return;

      //add map nodes
      start.connections = connections.map((c) => c.map as MapNode);
      setSelectedLocation(start);

      const initLocations = [start, ...start.connections];
      setLocations(initLocations);
      console.log(initLocations);
    };
    getMap();
  }, []);

  const handleVisitLocation = async (location: MapNode) => {
    if (fuel === 0) return; // User cannot click on nodes when fuel is 0

    //get all connections for this location
    if (!location.connections || location.connections?.length <= 1) {
      console.log("getting connections");
      //get any connections that exist in the database
      const connections = await getConnectedLocations(location.id);
      let mapNodes = connections?.map((c) => c.map as MapNode) ?? [];
      console.log("got connections", connections);

      //check and see if we are still only at one - this means we need to make some more
      if (mapNodes.length <= 1) {
        //generate some new locations and connections
        const generatedLocations = await connectNewMapLocations(location);

        //save to database
        const newLocationsDb = await saveMapCoordinates(generatedLocations);
        if (!newLocationsDb) return;
        await saveConnections(
          newLocationsDb.map((n) => ({ start: location.id, end: n.id }))
        );

        //set the currently location to be visited
        await setVisited(location.id);

        generatedLocations.forEach((n, i) => {
          n.id = newLocationsDb[i].id;
          n.connections = [location];
          n.visited = false;
        });

        mapNodes.push(...generatedLocations);

        // Deduct fuel for generating new nodes
        setFuel((prevFuel) => prevFuel - 1);
      }

      location.visited = true;

      //If no connections then we are on the edge of the graph. Create some new ones.
      setLocations([...locations, ...mapNodes]);
    }

    //update current location
    setSelectedLocation(location);
  };

  const connectNewMapLocations = async (location: MapNode) => {
    //generate some new features near this location
    //create some random heading vectors in [x,y,z] format
    const headings = Array.from({ length: 3 }, randomHeading);

    const { id, connections, visited, ...locationDesc } = location;

    const coordinatesString = await getGroqCompletionParallel(
      headings.map(
        (h) =>
          `Current planet: ${JSON.stringify(locationDesc)}. New heading: ${h}`
      ),
      128,
      headings.map((h) => newLocationPrompt),
      true
    );

    console.log(coordinatesString);
    const coordinates = coordinatesString.map((c) => JSON.parse(c));
    console.log(coordinates);

    return coordinates;
  };

  const randomHeading = () => {
    return `${Math.random() * scale},${Math.random() * scale},${
      Math.random() * scale
    }`;
  };

  const handleCreateImage = async (imageUrl: string) => {
    setImageUrl(imageUrl);
    setShowSketch(false);
    setPlanetView(false);

    if (selectedLocation?.description.includes("O")) {
      setFuel((prevFuel) => prevFuel + 1);
    } else if (selectedLocation?.description.includes("Z")) {
      router.push("/");
    }
  };

  const handlePlanetView = async () => {
    setPlanetView(true);
    setShowSketch(false);

    const prompt = `You are an astrophotographer who only describes the planet view that overlooking the planet based on the name of the planet ${selectedLocation?.description}`;
    const imageUrl = await generateImageFal(prompt, "landscape_16_9");
    setImageUrl(imageUrl);
  };

  const handleBackToShip = () => {
    setShowSketch(false);
    setPlanetView(false);
    setImageUrl("");
  };

  const handleReturnToBase = () => {
    router.push("/");
  };

  return (
    <main className="flex min-h-screen flex-col items-end justify-between p-24">
      <div className="z-10 max-w-lg w-full items-center justify-between font-mono text-sm lg:flex">
        <div className="flex flex-col w-full">
          <div>
            <span>{selectedLocation?.description}</span>
            {selectedLocation && (
              <div className="flex gap-4 items-center">
                <button
                  className="p-2 bg-white rounded-lg"
                  onClick={handlePlanetView}
                >
                  Planet View
                </button>
                <button
                  className="p-2 bg-white rounded-lg"
                  onClick={() => setShowSketch(true)}
                  disabled={fuel === 0}
                >
                  Visit Planet
                </button>
                <button
                  className="p-2 bg-white rounded-lg"
                  onClick={handleBackToShip}
                >
                  Back to Ship
                </button>
                <button
                  className="p-2 bg-white rounded-lg"
                  onClick={handleReturnToBase}
                >
                  Return to Base
                </button>
                <span className="ml-auto">Fuel: {fuel}</span>
              </div>
            )}
          </div>
          <ZoomablePannableCanvas
            initMap={locations}
            onSelect={(location: MapNode) => handleVisitLocation(location)}
            selectedLocation={selectedLocation}
          />
          {showSketch && (
            <SketchToImage
              prompt={`An alien planet landscape photograph of ${selectedLocation?.description}, NASA exploration rover POV, dirt or water on lens`}
              onCreate={handleCreateImage}
            />
          )}
          {imageUrl && <BlendImage src={imageUrl} fullscreen />}
        </div>
      </div>
    </main>
  );
}

const newLocationPrompt = `You describe new planet names as a player travels from a current planet in a given direction. Return the new planet location as a valid JSON object in the format {description:string, x:int, y:int, z:int}. Only return the JSON object with no other text or explanation. Generate only planet names, no other types of names.`;
