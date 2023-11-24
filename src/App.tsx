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
  const [isActive, setIsActive] = useState(false);
  const [recordedBlobSize, setRecordedBlobSize] = useState<
    number | undefined
  >();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const canvasStreamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<NodeJS.Timer | undefined>();
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[] | null>([]);

  const onMediaRecorderError = (event: Event) => {
    console.error((event as any)?.error);
  };

  const onVideoDataAvailable = (event: BlobEvent) => {
    if (event.data.size <= 0 || !recordedChunksRef.current) {
      return;
    }
    recordedChunksRef.current.push(event.data);
  };

  const onMediaRecorderStop = () => {
    if (!recordedChunksRef.current) {
      return;
    }
    const recordedBlob = new Blob(recordedChunksRef.current);
    setRecordedBlobSize(recordedBlob.size);
  };

  useEffect(() => {
    if (!canvasRef.current) {
      return;
    }
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return;
    }

    if (!mediaRecorderRef.current) {
      canvasStreamRef.current = canvasRef.current.captureStream(60);
      mediaRecorderRef.current = new MediaRecorder(canvasStreamRef.current);
      mediaRecorderRef.current.addEventListener(
        'dataavailable',
        onVideoDataAvailable
      );
      mediaRecorderRef.current.addEventListener('error', onMediaRecorderError);
      mediaRecorderRef.current.addEventListener('stop', onMediaRecorderStop);
    }

    if (isActive) {
      recordedChunksRef.current = [];

      /**
       * utilizes `timeslice` argument to ensure video chunks are recorded granularly
       * {@link https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder/start#timeslice | MediaRecorder: start() method `timeslice` property}
       */
      mediaRecorderRef.current.start(1000);

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
      if (mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
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
    <div className="flex justify-center items-center h-screen w-screen bg-slate-800">
      <div className="flex flex-col items-center gap-6">
        <canvas ref={canvasRef} width="131.5" height="134.75" />
        <button
          className="bg-[#eb5934] text-white cursor-pointer p-1.5 rounded-full border-0 w-[120px] uppercase hover:bg-[#eb4034]"
          onClick={() => setIsActive((previous) => !previous)}
        >
          {!isActive ? 'Start' : 'Stop'}
        </button>
        {recordedBlobSize && (
          <div className="bg-slate-300 rounded-full px-3 py-1 fixed right-4 bottom-4">
            Recorded Video Size in Bytes: <strong>{recordedBlobSize}</strong>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
