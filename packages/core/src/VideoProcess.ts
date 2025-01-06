import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile } from "@ffmpeg/util";

import { EditorState } from "./EditorState.ts";
import { Video } from "./elements/resource/Video.ts";
import { matchVideoBaseInfo } from "./utils/index.ts";

declare class MediaStreamTrackProcessor {
  constructor(init: { track: MediaStreamTrack });
  readable: ReadableStream;
}

class VideoProcess {
  ffmpeg: FFmpeg;
  state: EditorState;

  private videoDecoder: VideoDecoder;

  constructor({ ffmpeg, state }: { ffmpeg: FFmpeg; state: EditorState }) {
    this.ffmpeg = ffmpeg;
    this.state = state;

    this.videoDecoder = new VideoDecoder({
      output: (frame) => {
        console.log(frame);
      },
      error: (error) => {
        console.error(error);
      },
    });

    this.videoDecoder.configure({
      codec: "h264",
      codedWidth: 1920,
      codedHeight: 1080,
    });
  }

  private collectFFmpegLogs(): Promise<{
    width: number;
    height: number;
    frameRate: number;
    duration: number;
    createTime: Date;
    codec: string;
  }> {
    return new Promise((resolve, reject) => {
      let videoInfo = "";

      const logHandler = ({ message }: { message: string }) => {
        if (message.includes("error")) {
          this.ffmpeg.off("log", logHandler);
          reject(new Error(message));
        }

        videoInfo += message;
        if (message.includes("Aborted()")) {
          this.ffmpeg.off("log", logHandler);
          resolve(matchVideoBaseInfo(videoInfo));
        }
      };

      this.ffmpeg.on("log", logHandler);
    });
  }

  private async getVideoCover(file: File) {
    const outputFileName = `${file.name}_cover.jpg`;

    await this.ffmpeg.exec([
      "-i",
      file.name,
      "-vf",
      `thumbnail`,
      "-vframes",
      "1",
      outputFileName,
    ]);

    const data = await this.ffmpeg.readFile(outputFileName);
    await this.ffmpeg.deleteFile(outputFileName);

    const blob = new Blob([data], { type: "image/jpeg" });
    return URL.createObjectURL(blob);
  }

  private async getVideoBaseInfo(file: File) {
    const infoLogPromise = this.collectFFmpegLogs();
    await this.ffmpeg.exec(["-i", file.name]);
    const { width, height, frameRate, duration, createTime, codec } =
      await infoLogPromise;

    const cover = await this.getVideoCover(file);

    return { width, height, frameRate, duration, createTime, cover, codec };
  }

  // 添加编码格式映射函数
  private mapFFmpegCodecToWebCodec(ffmpegCodec: string): string {
    const codecMap: Record<string, string> = {
      h264: "avc1.42E01E",
      hevc: "hevc",
      vp8: "vp8",
      vp9: "vp9",
      av1: "av01",
    };

    return codecMap[ffmpegCodec.toLowerCase()] || "avc1.42E01E";
  }

  onVideoUpload = async ({ file }: { file: File }) => {
    const newVideo = new Video({
      name: file.name,
      fileSize: file.size,
      fileType: file.type,
      fileUrl: URL.createObjectURL(file),
    });

    this.state.setVideos([...this.state.getVideos(), newVideo]);

    try {
      this.ffmpeg.writeFile(file.name, await fetchFile(file));

      const { width, height, frameRate, duration, createTime, cover, codec } =
        await this.getVideoBaseInfo(file);

      newVideo.width = width;
      newVideo.height = height;
      newVideo.frameRate = frameRate;
      newVideo.duration = Number(duration.toFixed(2));
      newVideo.createTime = createTime;
      newVideo.cover = cover;
      newVideo.codec = this.mapFFmpegCodecToWebCodec(codec);
      newVideo.status = "finished";
    } catch (error) {
      newVideo.status = "error";
    }

    this.state.setVideos([
      ...this.state.getVideos().filter((v) => v.id !== newVideo.id),
      newVideo,
    ]);
  };

  async extractFrames(
    startTime: number,
    endTime: number,
    count: number,
    video: Video,
  ): Promise<ImageData[]> {
    const frames: ImageData[] = [];
    const timePoints = this.calculateTimePoints(startTime, endTime, count);

    const decoder = new VideoDecoder({
      output: (frame) => {
        const canvas = new OffscreenCanvas(
          frame.displayWidth,
          frame.displayHeight,
        );
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(frame, 0, 0);
          frames.push(
            ctx.getImageData(0, 0, frame.displayWidth, frame.displayHeight),
          );
        }
        frame.close();
      },
      error: (e) => {},
    });

    try {
      // 配置解码器
      const videoTrack = await this.getVideoTrack(video.fileUrl);

      const config = {
        codec: video.codec,
        codedWidth: video.width,
        codedHeight: video.height,
      };
      decoder.configure(config);

      // 对每个时间点进行解码
      for (const timePoint of timePoints) {
        const keyFrame = await this.seekAndGetKeyFrame(videoTrack, timePoint);

        console.log(keyFrame);

        if (keyFrame) {
          decoder.decode(keyFrame);
        }
      }

      // 等待所有帧处理完成
      await decoder.flush();
      decoder.close();

      return frames;
    } catch (error) {
      console.error("Frame extraction failed:", error);
      throw error;
    }
  }

  private async getVideoTrack(fileUrl: string): Promise<MediaStreamTrack> {
    const video = document.createElement("video");
    video.src = fileUrl;
    await video.play();
    // @ts-expect-error: captureStream exists in modern browsers
    const stream = video.captureStream() as MediaStream;

    const [videoTrack] = stream.getVideoTracks();
    video.remove();
    return videoTrack;
  }

  private async seekAndGetKeyFrame(
    track: MediaStreamTrack,
    timestamp: number,
  ): Promise<EncodedVideoChunk | null> {
    // @ts-ignore: MediaStreamTrackProcessor exists in modern browsers
    const reader = new MediaStreamTrackProcessor({
      track,
    }).readable.getReader();

    try {
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        // 检查是否达到目标时间戳
        if (value.timestamp >= timestamp) {
          return new EncodedVideoChunk({
            type: "key",
            timestamp: value.timestamp,
            duration: value.duration,
            data: new Uint8Array(value.data),
          });
        }
      }
    } finally {
      reader.releaseLock();
    }

    return null;
  }

  private calculateTimePoints(
    start: number,
    end: number,
    count: number,
  ): number[] {
    const interval = (end - start) / (count - 1);
    return Array.from({ length: count }, (_, i) => start + interval * i);
  }
}

export { VideoProcess };
