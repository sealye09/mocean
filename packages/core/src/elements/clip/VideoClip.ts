import { v4 as uuidv4 } from "uuid";

import { CanvasRender } from "../../interfaces/CanvasRender";
import { Clip } from "../../interfaces/Clip";

class VideoClip implements Clip, CanvasRender {
  id: string;
  resourceId: string;
  name: string;
  startTimestamp: number;
  endTimestamp: number;
  type: "image" | "video" | "audio" | "text";

  x: number;
  y: number;
  renderWidth: number;
  renderHeight: number;
  rotation: number;

  constructor({
    resourceId,
    name,
    startTimestamp,
    endTimestamp,
    x,
    y,
    renderWidth,
    renderHeight,
    rotation,
  }: {
    resourceId: string;
    name: string;
    startTimestamp: number;
    endTimestamp: number;
    x: number;
    y: number;
    renderWidth: number;
    renderHeight: number;
    rotation: number;
  }) {
    this.id = uuidv4();
    this.resourceId = resourceId;
    this.name = name;
    this.startTimestamp = startTimestamp;
    this.endTimestamp = endTimestamp;
    this.type = "video";

    this.x = x;
    this.y = y;
    this.renderWidth = renderWidth;
    this.renderHeight = renderHeight;
    this.rotation = rotation;
  }
}

export { VideoClip };
