"use client";

import { STORY_SCENES } from "@/lib/story-scenes";

export function StoryImageLayer() {
  return (
    <div className="absolute inset-0 pointer-events-none z-10">
      {STORY_SCENES.map((scene) => (
        <div 
          key={scene.id} 
          id={`story-image-container-${scene.id}`}
          className="absolute inset-0 flex items-center justify-center opacity-0 invisible"
        >
          {scene.imageAvailable && scene.image && (
            <div className="relative w-full h-full overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                id={`story-image-${scene.id}`}
                src={scene.image} 
                alt=""
                className="absolute inset-0 w-full h-full object-cover origin-center"
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
