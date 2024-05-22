import { useEffect, useState } from "react";

type BlendImageProps = {
  src: string;
  fullscreen: boolean;
};

//blends an new image over the top of any previously rendered image
export default function BlendImage({
  src: image,
  fullscreen,
}: BlendImageProps) {
  const [currentImg, setCurrentImg] = useState<string>("");
  const [nextImg, setNextImg] = useState<string>("");

  useEffect(() => {
    setNextImg(image);
    const timeout = setTimeout(() => {
      setCurrentImg(image);
      setNextImg("");
    }, 2000); // Delay for the fade effect to complete
    return () => clearTimeout(timeout);
  }, [image]);

  return (
    <div
      className={`${
        fullscreen
          ? "fixed top-0 left-0 -z-50 min-w-[100vw] min-h-[100vh]"
          : `relative max-w-full w-[1024px] h-[600px]`
      }`}
    >
      {currentImg && (
        <>
          <div
            className={`${
              fullscreen && "absolute top-0 left-0"
            } w-full h-full bg-cover bg-no-repeat bg-center`}
            style={{
              backgroundImage: `url(${currentImg})`,
            }}
          />
          <div
            className="absolute top-0 left-0 w-full h-full transition-opacity duration-[2s] bg-cover bg-no-repeat bg-center"
            style={{
              backgroundImage: `url(${nextImg})`,
              opacity: nextImg ? "1" : "0",
              zIndex: nextImg ? "10" : "-10",
            }}
          />
        </>
      )}
    </div>
  );
}
