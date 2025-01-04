import React from "react";

import type { Video, VideoClip } from "@video-editor/core";

interface VideoSourceProviderProps {
  videoClips: Array<VideoClip & { video: Video | null }>;
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
          videoClip.video && (
            <video
              key={videoClip.id}
              ref={(node) => {
                if (node && videoClip.video) {
                  onElementUpdate(videoClip.id, { element: node });
                }
              }}
              src={videoClip.video.fileUrl}
              hidden
            />
          ),
      )}
    </>
  );
};
