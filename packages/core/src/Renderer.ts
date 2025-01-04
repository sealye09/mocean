import { EditorState } from "./EditorState.js";
import { VideoClip } from "./elements/clip/VideoClip.js";
import type { Video } from "./index.js";

class Renderer {
  state: EditorState;
  width: number;
  height: number;
  onVideoPlay: (videoClip: VideoClip, currentTime: number) => void;

  constructor({
    state,
    width,
    height,
    onVideoPlay,
  }: {
    state: EditorState;
    width: number;
    height: number;
    onVideoPlay: (videoClip: VideoClip, currentTime: number) => void;
  }) {
    this.state = state;
    this.width = width;
    this.height = height;
    this.onVideoPlay = onVideoPlay;
  }

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
}

export { Renderer };
