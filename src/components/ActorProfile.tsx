import React from 'react';
import Image from 'next/image';
import { Actor } from '../types';

interface ActorProfileProps {
  actor: Actor;
}

const ActorProfile: React.FC<ActorProfileProps> = ({ actor }) => {
  return (
    <div className="p-4 flex flex-col items-center justify-start md:border-r md:border-gray-700">
      {actor.profile_path ? (
        <Image
          src={`https://image.tmdb.org/t/p/w500${actor.profile_path}`}
          alt={actor.name}
          width={200}
          height={300}
          className="rounded-lg object-cover"
        />
      ) : (
        <div className="w-[200px] h-[300px] bg-gray-700 rounded-lg flex items-center justify-center">
          <span className="text-gray-400">No Image</span>
        </div>
      )}
      <h2 className="text-2xl font-bold mt-4 text-center">{actor.name}</h2>
    </div>
  );
};

export default ActorProfile;
