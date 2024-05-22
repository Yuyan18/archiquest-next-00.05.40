"use server";

import * as fal from "@fal-ai/serverless-client";
const fal_key = process.env.FAL_KEY ?? process.env.FAL ?? "";

fal.config({
  credentials: fal_key, // or a function that returns a string
});

type Image = {
  url: string;
  file_name: string;
  file_size: number;
};
type Result = {
  images: Image[];
};

// This function makes a request to the FAL api and gets an image.
export async function generateImageFal(
  prompt: string,
  image_size: string,
  model:
    | "fast-turbo-diffusion"
    | "hyper-sdxl"
    | "fast-sdxl" = "fast-turbo-diffusion",
  negativePrompt: string = "cartoon, illustration, animation, face, male, female, ugly"
) {
  const result: Result = await fal.run(`fal-ai/${model}`, {
    input: {
      prompt: prompt,
      negativePrompt: negativePrompt,
      image_size: image_size,
      sync_mode: true,
    },
  });
  return result.images[0].url;
}

const seed = Math.floor(Math.random() * 100000);

// This function makes a request to the FAL api and gets an image.
export async function generateImageToImageFal(
  prompt: string,
  image_url: string,
  randomSeed: boolean = false
) {
  const generationSeed = randomSeed ? Math.floor(Math.random() * 100000) : seed;
  const result: Result = await fal.run(`fal-ai/lcm-sd15-i2i`, {
    input: {
      prompt: prompt,
      image_url: image_url,
      strength: 0.99,
      sync_mode: true,
      seed: generationSeed,
    },
  });
  return result.images[0].url;
}
