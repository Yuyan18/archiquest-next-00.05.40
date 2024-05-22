import { generateImageFal } from "@/ai/fal";
import { getGroqCompletion } from "@/ai/groq";
import { useEffect, useState } from "react";
import BlendImage from "./BlendImage";

type AnimationProps = {
  prompt: string;
  systemPrompt: string;
  imageSize: "landscape_16_9" | "square";
  animate: number;
  fullscreen: boolean;
  onChange?: (url: string) => void;
};

//Component that uses groq to generate image descriptions from prompts, then uses fal to generates the image and blends them together.
//All runs on an animation timer
export default function Animation({
  prompt,
  systemPrompt,
  imageSize,
  animate,
  fullscreen,
  onChange,
}: AnimationProps) {
  const [image, setImage] = useState<string>("");

  useEffect(() => {
    async function generateImage() {
      const imageDescription = await getGroqCompletion(
        prompt,
        64,
        systemPrompt
      );
      const url = await generateImageFal(imageDescription, imageSize);
      return url;
    }

    if (animate === 0) {
      generateImage().then((url) => setImage(url));
    } else {
      const interval = setInterval(async () => {
        const url = await generateImage();
        setImage(url); // Set new image
        if (onChange) onChange(url);
      }, animate);

      return () => clearInterval(interval); // Cleanup
    }
  }, [prompt, animate, systemPrompt, imageSize, onChange]);

  return <BlendImage src={image} fullscreen={fullscreen} />;
}
