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
import { generateImageToImageFal } from "@/ai/fal";

//Demo of generating a map of coordinates that can be selected

export default function ExplorationPage() {
  const [selectedLocation, setSelectedLocation] = useState<MapNode | null>(
    null
  );
  const [locations, setLocations] = useState<MapNode[]>([]);
  const [imageUrl, setImageUrl] = useState<string>("");
  const [showSketch, setShowSketch] = useState<boolean>(false);

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
          `Current location: ${JSON.stringify(locationDesc)}. New heading: ${h}`
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
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
        <div className="flex flex-col">
          <span className="text-xl">{selectedLocation?.description}</span>
          <ZoomablePannableCanvas
            initMap={locations}
            onSelect={(location: MapNode) => handleVisitLocation(location)}
            selectedLocation={selectedLocation}
          />
          {selectedLocation && !showSketch && (
            <button
              className="p-2 bg-white rounded-lg"
              onClick={() => setShowSketch(true)}
            >
              Sketch Image
            </button>
          )}
          {showSketch ? (
            <SketchToImage
              prompt={selectedLocation?.description ?? ""}
              onCreate={handleCreateImage}
            />
          ) : (
            imageUrl && <BlendImage src={imageUrl} fullscreen />
          )}
        </div>
      </div>
    </main>
  );
}

const newLocationPrompt = `You describe new map locations as a player adventures from a current location in a given direction.
Return the new map location as a valid JSON object in the format {description:string, x:int, y:int, z:int}. Only return the JSON object with no other text or explanation.`;