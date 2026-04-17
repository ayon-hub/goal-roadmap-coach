import path from "path";
import type { Response } from "express";

export function sendIndexHtml(res: Response, publicPath: string): void {
  res.sendFile(path.join(publicPath, "index.html"));
}
