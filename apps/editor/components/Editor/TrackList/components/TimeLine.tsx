import { useCallback, useContext, useEffect, useRef } from "react";

import { EditorContext } from "../../index";

interface TimeLineProps {
  fontSize?: number;
}

// 绘制主刻度线
const drawMainScale = (
  ctx: CanvasRenderingContext2D,
  x: number,
  height: number,
) => {
  ctx.beginPath();
  ctx.moveTo(x, height);
  ctx.lineTo(x, height / 2);
  ctx.stroke();
};

// 绘制小刻度线
const drawSubScales = (
  ctx: CanvasRenderingContext2D,
  x: number,
  unitPixel: number,
  height: number,
) => {
  const subUnitPixel = unitPixel / 5;
  for (let j = 1; j < 5; j++) {
    const subX = x + j * subUnitPixel;
    ctx.beginPath();
    ctx.moveTo(subX, height);
    ctx.lineTo(subX, (height * 2) / 3);
    ctx.stroke();
  }
};

// 格式化时间标签
const formatTimeLabel = (time: number): string => {
  const seconds = time / 1000;
  return Number.isInteger(seconds) ? `${seconds}s` : seconds.toFixed(1) + "s";
};

// 设置画布样式
const setupCanvasStyle = (ctx: CanvasRenderingContext2D, fontSize: number) => {
  ctx.strokeStyle = "#94a3b8"; // slate-400
  ctx.fillStyle = "#000000"; // 文字颜色设置为纯黑
  ctx.font = `${fontSize}px sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  ctx.lineWidth = 1;
};

export const TimeLine: React.FC<TimeLineProps> = ({ fontSize = 10 }) => {
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const editor = useContext(EditorContext)!;

  const updateCanvasSize = useCallback(() => {
    const canvas = canvasRef.current;
    const container = canvasContainerRef.current;
    if (!canvas || !container) return;

    const { clientWidth, clientHeight } = container;
    const dpr = window.devicePixelRatio || 1;

    // 设置 canvas 的显示尺寸
    canvas.style.width = `${clientWidth}px`;
    canvas.style.height = `${clientHeight}px`;

    // 设置 canvas 的实际尺寸，考虑设备像素比
    canvas.width = clientWidth * dpr;
    canvas.height = clientHeight * dpr;

    // 调整 canvas context 的缩放
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.scale(dpr, dpr);
    }
  }, []);

  const drawTimeScale = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      x: number,
      time: number,
      height: number,
    ) => {
      // 绘制主刻度线
      drawMainScale(ctx, x, height);

      // 绘制时间标签
      const label = formatTimeLabel(time);
      ctx.fillText(label, x, height / 7);
    },
    [],
  );

  const drawTimeLine = useCallback(() => {
    const canvasContainer = canvasContainerRef.current;
    const canvas = canvasRef.current;
    if (!canvas || !canvasContainer) return;

    const width = canvasContainer.clientWidth;
    const height = canvasContainer.clientHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // 清空画布
    ctx.clearRect(0, 0, width, height);

    const unitTime = editor.state.getUnitTime(); // 单位时间(毫秒)
    const unitPixel = editor.state.getUnitPixelOfTime(); // 单位时间像素长度

    // 设置画布样式
    setupCanvasStyle(ctx, fontSize);

    // 添加起始偏移量，为刻度线宽度的一半
    const startOffset = ctx.lineWidth / 2 + 4.5;

    // 计算需要绘制的刻度数量（考虑偏移量后的可用宽度）
    const totalUnits = Math.floor((width - startOffset) / unitPixel);

    // 绘制刻度和时间标签
    for (let i = 0; i <= totalUnits; i++) {
      const x = startOffset + i * unitPixel;
      const time = i * unitTime;

      // 绘制时间刻度（包含主刻度线和时间标签）
      drawTimeScale(ctx, x, time, height);

      // 在主刻度之间绘制小刻度
      if (i < totalUnits) {
        drawSubScales(ctx, x, unitPixel, height);
      }
    }
  }, [editor.state, fontSize]);

  // 监听窗口尺寸变化
  useEffect(() => {
    const resizeObserver = new ResizeObserver(() => {
      updateCanvasSize();
      drawTimeLine();
    });

    if (canvasContainerRef.current) {
      resizeObserver.observe(canvasContainerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, [drawTimeLine, updateCanvasSize]);

  // 初始渲染
  useEffect(() => {
    updateCanvasSize();
    drawTimeLine();
  }, [updateCanvasSize, drawTimeLine, fontSize]);

  return (
    <div ref={canvasContainerRef} className="h-full w-full">
      <canvas ref={canvasRef} className="h-full w-full" />
    </div>
  );
};
