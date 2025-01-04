import { EditorState } from "./EditorState.ts";
import { Track } from "./elements/Track.ts";
import { Video } from "./elements/resource/Video.ts";
import { VideoClip } from "./elements/clip/VideoClip.ts";
import { Renderer } from "./Renderer.ts";

class TimeManager {
  private state: EditorState;
  private renderer?: Renderer;

  private animationFrameId: number | null = null;

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

  private updatePlayTime(deltaTime: number) {
    const currentPlayTime = this.state.getCurrentTime();
    // 更新播放时间，将 deltaTime 从毫秒转换为秒
    this.state.setCurrentTime(currentPlayTime + deltaTime / 1000);
    return currentPlayTime;
  }

  private updateVideoElements(currentPlayTime: number) {
    const tracks = this.state.getTracks();
    tracks.forEach((track) => {
      track.getRenderElementsAtTime(currentPlayTime).forEach((element) => {
        if(element.type === 'video'){
          this.renderer?.onVideoPlay(element, currentPlayTime);
        }
      });
    });
  }

  startPlay(){
    if (this.animationFrameId !== null) {
      return; // 避免重复启动
    }

    let lastTime = performance.now();
    const frameInterval = 1000 / this.state.getFps(); // 每帧的时间间隔（毫秒）

    const animate = () => {
      const currentTime = performance.now();
      const deltaTime = currentTime - lastTime;

      console.log(currentTime, deltaTime);
      

      // 如果经过的时间大于等于一帧所需时间，则更新
      if (deltaTime >= frameInterval) {
        const currentPlayTime = this.updatePlayTime(deltaTime);
        this.updateVideoElements(currentPlayTime);
        lastTime = currentTime;
      }

      this.animationFrameId = requestAnimationFrame(animate);
    };

    this.animationFrameId = requestAnimationFrame(animate);
  }

  stopPlay() {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }
}

export { TimeManager };
