import { Hono } from "hono";

type RouteDefinition = {
  path: string;
  method: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  handler: (...args: any[]) => any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  middleware?: Array<(...args: any[]) => any>;
};

/**
 * 创建测试用 Hono 应用，自动注册路由
 * 用于集成测试中避免重复的路由注册样板代码
 */
export function createTestApp(routes: RouteDefinition[]): Hono {
  const app = new Hono();
  for (const route of routes) {
    const method = route.method.toLowerCase() as
      | "get"
      | "post"
      | "put"
      | "delete";
    app.on(method, route.path, ...(route.middleware || []), route.handler);
  }
  return app;
}
