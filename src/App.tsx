import { useEffect, useRef, useState } from 'react';

const getRandomNumber = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1) + min);
};

const getImage = (index: number) => {
  const image = new Image();
  image.src = `/dice-${index}.png`;
  return image;
};

const images = [
  getImage(0),
  getImage(1),
  getImage(2),
  getImage(3),
  getImage(4),
  getImage(5),
  getImage(6),
];

function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isActive, setIsActive] = useState(false);
  let intervalRef = useRef<NodeJS.Timer | undefined>();

  useEffect(() => {
    if (!canvasRef.current) {
      return;
    }
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return;
    }

    if (isActive) {
      intervalRef.current = setInterval(() => {
        const image = images[getRandomNumber(1, 6)];
        const onLoad = () =>
          ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
        if (image.complete) {
          onLoad();
        } else {
          image.onload = onLoad;
        }
      }, 100);
    } else {
      clearInterval(intervalRef.current);
    }
  }, [isActive]);

  useEffect(() => {
    if (!canvasRef.current) {
      return;
    }
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return;
    }

    const image = images[6];
    const onLoad = () =>
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    if (image.complete) {
      onLoad();
    } else {
      image.onload = onLoad;
    }
  }, []);

  return (
    <div className="flex justify-center items-center h-screen">
      <div className="flex flex-col items-center gap-6">
        <canvas ref={canvasRef} width="131.5" height="134.75" />
        <button
          className="bg-[#eb5934] text-white cursor-pointer p-1.5 rounded-full border-0 w-[120px] uppercase hover:bg-[#eb4034]"
          onClick={() => setIsActive((previous) => !previous)}
        >
          {!isActive ? 'Start' : 'Stop'}
        </button>
      </div>
    </div>
  );
}

export default App;
