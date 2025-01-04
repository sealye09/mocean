import React from "react";

import type { VideoClip } from "@video-editor/core";

interface VideoSourceProviderProps {
  videoClips: Array<VideoClip>;
  onElementUpdate: (id: string, element: { element: HTMLVideoElement }) => void;
}

export const VideoSourceProvider: React.FC<VideoSourceProviderProps> = ({
  videoClips,
  onElementUpdate,
}) => {
  return (
    <>
      {videoClips.map(
        (videoClip) =>
          videoClip.resource && (
            <video
              key={videoClip.id}
              ref={(node) => {
                if (node && videoClip.resource) {
                  onElementUpdate(videoClip.id, { element: node });
                }
              }}
              src={videoClip.resource.fileUrl}
              hidden
            />
          ),
      )}
    </>
  );
};
