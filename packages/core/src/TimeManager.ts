import { EditorState } from "./EditorState.ts";
import { Track } from "./elements/Track.ts";
import { Video } from "./elements/resource/Video.ts";
import { VideoClip } from "./elements/clip/VideoClip.ts";
import { Renderer } from "./Renderer.ts";

class TimeManager {
  private state: EditorState;
  private renderer?: Renderer;

  constructor(state: EditorState) {
    this.state = state;
  }

  setRenderer(renderer: Renderer) {
    this.renderer = renderer;
  }

  addVideoToTrack(video: Video) {
    const trackList = this.state.getTracks();

    const track = new Track(`track-${trackList.length + 1}`);

    const { width, height, x, y } = this.renderer!.calculateElementInitPosition(video);

    const videoClip = new VideoClip({
      resourceId: video.id,
      name: video.name,
      startTimestamp: 0,
      endTimestamp: video.duration,

      x,
      y,
      renderWidth: width,
      renderHeight: height,
      rotation: 0,
    });

    track.renderElements.push(videoClip);
    this.state.setTracks([...trackList, track]);
  }
}

export { TimeManager };
