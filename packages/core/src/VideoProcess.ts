import MP4Box from "@webav/mp4box.js";
import type { MP4ArrayBuffer, MP4File, TrakBoxParser } from "@webav/mp4box.js";

import { EditorState } from "./EditorState.ts";
import { Video } from "./elements/resource/Video.ts";

class VideoProcess {
  state: EditorState;
  file: MP4File;

  constructor({ state }: { state: EditorState }) {
    this.state = state;
  }

  /**
   * 获取视频封面
   */
  private getVideoCover(videoUrl: string): Promise<string> {
    return new Promise((resolve) => {
      const video = document.createElement("video");
      video.src = videoUrl;
      video.currentTime = 0;
      video.addEventListener("loadeddata", () => {
        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg"));
      });
    });
  }

  /**
   * 解析视频编解码器描述信息
   */
  private parseVideoCodecDesc(track: TrakBoxParser): Uint8Array {
    for (const entry of track.mdia.minf.stbl.stsd.entries) {
      // @ts-expect-error
      const box = entry.avcC ?? entry.hvcC ?? entry.av1C ?? entry.vpcC;
      if (box != null) {
        const stream = new MP4Box.DataStream(
          undefined,
          0,
          MP4Box.DataStream.BIG_ENDIAN,
        );
        box.write(stream);
        return new Uint8Array(stream.buffer.slice(8));
      }
    }
    throw Error("avcC, hvcC, av1C or VPX not found");
  }

  /**
   * 获取视频基本信息
   */
  private async getVideoBaseInfo(fileUrl: string): Promise<{
    width: number;
    height: number;
    frameRate: number;
    duration: number;
    createTime: Date;
    codec: string;
    videoFrames: VideoFrame[];
  }> {
    return new Promise((resolve, reject) => {
      const mp4File = MP4Box.createFile();
      let width: number;
      let height: number;
      let frameRate: number;
      let duration: number;
      let createTime: Date;
      let codec: string;
      let description: Uint8Array;
      const videoFrames: VideoFrame[] = [];

      let decoder: VideoDecoder;

      const BATCH_SIZE = 100;
      let currentSamples = 0;
      let totalSamples = 0;

      mp4File.onError = (error) => {
        reject(new Error(error));
      };

      mp4File.onReady = async (info) => {
        const videoTrack = info.videoTracks[0];
        if (!videoTrack) {
          reject(new Error("No video track found"));
          return;
        }

        width = videoTrack.track_width;
        height = videoTrack.track_height;

        const totalSeconds = videoTrack.duration / videoTrack.timescale;
        frameRate = Math.round(videoTrack.nb_samples / totalSeconds);
        totalSamples = videoTrack.nb_samples;

        duration = videoTrack.duration / videoTrack.timescale;
        createTime = new Date(videoTrack.created);
        codec = videoTrack.codec;

        description = this.parseVideoCodecDesc(
          mp4File.getTrackById(videoTrack.id),
        );

        decoder = new VideoDecoder({
          output: (chunk) => {
            videoFrames.push(chunk);

            if (currentSamples >= totalSamples) {
              mp4File.stop();
              decoder.flush();

              resolve({
                width,
                height,
                frameRate,
                duration,
                createTime,
                codec,
                videoFrames,
              });
            }
          },
          error: (error) => {
            reject(new Error(error.message));
          },
        });

        decoder.configure({
          codec,
          description,
          codedHeight: height,
          codedWidth: width,
        });

        mp4File.setExtractionOptions(videoTrack.id, "video", {
          nbSamples: BATCH_SIZE,
        });
        mp4File.start();
      };

      mp4File.onSamples = (id, user, samples) => {
        currentSamples += samples.length;
        for (const sample of samples) {
          decoder.decode(
            new EncodedVideoChunk({
              type: sample.is_sync ? "key" : "delta",
              timestamp: sample.cts,
              duration: sample.duration,
              data: sample.data,
            }),
          );
        }
      };

      mp4File.onFlush = () => {
        console.log("flush");
      };

      fetch(fileUrl)
        .then((response) => response.arrayBuffer())
        .then((buffer) => {
          const arrayBuffer = buffer as MP4ArrayBuffer;
          arrayBuffer.fileStart = 0;
          mp4File.appendBuffer(arrayBuffer);
        })
        .catch(reject);
    });
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
      const {
        width,
        height,
        frameRate,
        duration,
        createTime,
        codec,
        videoFrames,
      } = await this.getVideoBaseInfo(newVideo.fileUrl);

      console.log(videoFrames);

      const cover = await this.getVideoCover(newVideo.fileUrl);

      newVideo.width = width;
      newVideo.height = height;
      newVideo.frameRate = frameRate;
      newVideo.duration = Number(duration.toFixed(2));
      newVideo.createTime = createTime;
      newVideo.cover = cover;
      newVideo.codec = codec;
      newVideo.status = "finished";
    } catch (error) {
      console.error("Failed to process video:", error);
      newVideo.status = "error";
    }

    this.state.setVideos([
      ...this.state.getVideos().filter((v) => v.id !== newVideo.id),
      newVideo,
    ]);
  };

  public dispose() {
    if (this.file) {
      this.file.flush();
      this.file = null;
    }
  }
}

export { VideoProcess };
