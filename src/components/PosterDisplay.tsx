import React from 'react';
import Image from 'next/image';
import { Prediction } from '../types';

interface PosterDisplayProps {
  prediction: Prediction | null;
  generating: boolean;
}

const PosterDisplay: React.FC<PosterDisplayProps> = ({ prediction, generating }) => {
  const handleDownload = (imageUrl: string) => {
    window.open(`/api/download?url=${encodeURIComponent(imageUrl)}`, '_blank');
  };

  if (!generating && !prediction) {
    return (
        <div className="p-4 flex flex-col items-center justify-center text-gray-500">
            <p>The generated poster will appear here.</p>
        </div>
    );
  }

  return (
    <div className="p-4 flex flex-col items-center justify-center">
      {generating || (prediction && prediction.status !== 'succeeded' && prediction.status !== 'failed') ? (
        <div className="text-center">
          <p className="text-lg animate-pulse">Generating your poster...</p>
          {prediction && (
            <p className="text-sm opacity-75 mt-2">Status: {prediction.status}</p>
          )}
        </div>
      ) : prediction?.output ? (
        <div className="text-center">
          <div className="image-wrapper flex justify-center">
            <div className="w-full max-w-md">
              <Image
                src={prediction.output[prediction.output.length - 1]}
                alt="Generated poster"
                sizes="100vw"
                width={512}
                height={512}
                className="w-full h-auto rounded-lg"
              />
            </div>
          </div>
          <p className="py-3 text-sm opacity-50 text-center">
            status: {prediction.status}
          </p>
          <button
            onClick={() => handleDownload(prediction.output![prediction.output!.length - 1])}
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
          >
            Download Poster
          </button>
        </div>
      ) : null}
    </div>
  );
};

export default PosterDisplay;
