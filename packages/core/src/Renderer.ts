import { EditorState } from "./EditorState.js";
import { Track } from "./elements/Track.js";
import type { Video } from "./index.js";
import { CanvasRender } from "./interfaces/CanvasRender.js";
import { Clip } from "./interfaces/Clip.js";
import { VideoClip } from "./elements/clip/VideoClip.js";

class Renderer {
  state: EditorState;
  width: number;
  height: number;
  onVideoPlay: (videoClip: VideoClip) => void;
  private animationFrameId: number | null = null;

  constructor({
    state,
    width,
    height,
    onVideoPlay,
  }: {
    state: EditorState;
    width: number;
    height: number;
    onVideoPlay: (videoClip: VideoClip) => void;
  }) {
    this.state = state;
    this.width = width;
    this.height = height;
    this.onVideoPlay = onVideoPlay;
  }

  // addVideoToRenderer(id: string) {
  //   const video = this.state.getVideos().find((video) => video.id === id);
  //   const { width, height } = this.calculateDimensions(video);
  //   video.renderWidth = width;
  //   video.renderHeight = height;

  //   video.y = this.height / 2 - video.renderHeight / 2;

  //   this.state.setState({
  //     renderingVideoIds: [...this.state.getRenderingList(), id],
  //   });
  // }

  /**
   * 计算视频渲染尺寸
   * @param video 视频
   * @returns 渲染尺寸
   */
  calculateElementInitPosition = (video: Video) => {
    const videoRatio = video.width / video.height;

    let width = this.width;
    let height = this.width / videoRatio;

    if (height > this.height) {
      height = this.height;
      width = this.height * videoRatio;
    }

    const x = 0;
    const y = this.height / 2 - height / 2;

    return { width, height, x, y };
  };

  // private animate = (timestamp: number) => {
  //   if (!this.lastFrameTime) {
  //     this.lastFrameTime = timestamp;
  //   }

  //   const elapsed = timestamp - this.lastFrameTime;

  //   // 如果经过的时间大于等于帧间隔，则触发渲染
  //   if (elapsed >= this.frameInterval) {
  //     const renderingVideos = this.state
  //       .getRenderingList()
  //       .map((id) => this.state.getVideos().find((video) => video.id === id));

  //     renderingVideos.forEach((video) => {
  //       if (video) this.onVideoPlay(video);
  //     });

  //     this.lastFrameTime = timestamp - (elapsed % this.frameInterval);
  //   }

  //   // 继续下一帧
  //   this.animationFrameId = requestAnimationFrame(this.animate);
  // };


  private animate = (timestamp: number) => {};

  onPlay = () => {
    if (!this.animationFrameId) {
      this.animationFrameId = requestAnimationFrame(this.animate);
    }
  };

  onPause = () => {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  };W
}

export { Renderer };
