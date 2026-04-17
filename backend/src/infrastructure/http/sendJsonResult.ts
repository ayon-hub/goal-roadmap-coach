import type { Response } from "express";
import { sendError } from "./sendError";
import type { HttpErrorShape } from "./sendError";

export function sendJsonResult<T>(
  res: Response,
  operation: Promise<T>,
  onError?: (error: HttpErrorShape | null | undefined) => void
): void {
  operation
    .then((result) => {
      res.json(result);
    })
    .catch((error: HttpErrorShape | null | undefined) => {
      if (onError) {
        onError(error);
      }

      sendError(res, error);
    });
}
