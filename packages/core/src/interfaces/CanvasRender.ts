interface CanvasRender {
  /**@description 渲染的x坐标 */
  x: number;

  /**@description 渲染的y坐标 */
  y: number;

  /**@description 渲染的宽度 */
  renderWidth: number;

  /**@description 渲染的高度 */
  renderHeight: number;

  /**@description 旋转角度 */
  rotation: number;
}

export type { CanvasRender };
