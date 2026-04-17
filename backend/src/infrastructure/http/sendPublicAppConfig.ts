import type { Response } from "express";
import {
  getPublicAppConfig,
  toPublicConfigScript
} from "../../../../shared/config/publicAppConfig";

export function sendPublicAppConfig(res: Response): void {
  res.type("application/javascript");
  res.send(toPublicConfigScript(getPublicAppConfig()));
}
