import { useEffect, useRef, useState, memo } from 'react';

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

export const CanvasAnimation = () => {
  const [isActive, setIsActive] = useState(false);
  const [recordedBlobSize, setRecordedBlobSize] = useState<
    number | undefined
  >();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const canvasStreamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<NodeJS.Timer | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

  const drawImage = (canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return;
    }
    const image = images[getRandomNumber(1, 6)];
    const onLoad = () =>
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    if (image.complete) {
      onLoad();
    } else {
      image.onload = onLoad;
    }
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

    const onMediaRecorderError = (event: Event) => {
      console.error((event as any)?.error);
    };

    const onVideoDataAvailable = (event: BlobEvent) => {
      if (event.data.size <= 0) {
        return;
      }
      recordedChunksRef.current.push(event.data);
    };

    const onMediaRecorderStop = () => {
      const recordedBlob = new Blob(recordedChunksRef.current);
      setRecordedBlobSize(recordedBlob.size);
    };

    if (!canvasStreamRef.current) {
      canvasStreamRef.current = canvasRef.current.captureStream(60);
    }

    if (!mediaRecorderRef.current) {
      // add audio
      const ac = new AudioContext();
      const dest = ac.createMediaStreamDestination();
      const [audioTrack] = dest.stream.getAudioTracks();
      const [videoTrack] = canvasStreamRef.current.getVideoTracks();

      // setup `MediaRecorder`
      mediaRecorderRef.current = new MediaRecorder(
        new MediaStream([videoTrack, audioTrack])
      );
      mediaRecorderRef.current.addEventListener(
        'dataavailable',
        onVideoDataAvailable
      );
      mediaRecorderRef.current.addEventListener('error', onMediaRecorderError);
      mediaRecorderRef.current.addEventListener('stop', onMediaRecorderStop);
    }

    if (isActive) {
      // reset
      recordedChunksRef.current = [];

      // start recording from the canvas stream
      mediaRecorderRef.current.start();

      // draw one of 6 dice images to the canvas in an interval (randomly selected)
      intervalRef.current = setInterval(() => {
        drawImage(canvas);
      }, 0);

      drawImage(canvas);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (mediaRecorderRef.current?.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
    }
  }, [isActive]);

  useEffect(() => {
    if (!canvasRef.current) {
      return;
    }
    const canvas = canvasRef.current;
    drawImage(canvas);
  }, []);

  return (
    <>
      <canvas ref={canvasRef} width="131.5" height="134.75" />
      <button
        className="bg-orange-500 uppercase font-semibold rounded-full fixed px-6 py-1 bottom-4 left-4"
        data-testid="button-start-stop"
        onClick={() => setIsActive((previous) => !previous)}
      >
        {!isActive ? 'Start' : 'Stop'}
      </button>
      {typeof recordedBlobSize === 'number' && (
        <div className="bg-slate-300 uppercase font-semibold rounded-full fixed px-6 py-1 bottom-4 right-4">
          <strong data-testid="blob-size">{recordedBlobSize}</strong> Bytes
        </div>
      )}
    </>
  );
};

export default memo(CanvasAnimation, (prevProps_, nextProps_) => true);
