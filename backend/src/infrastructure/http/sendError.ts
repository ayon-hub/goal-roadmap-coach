import type { Response } from "express";

export interface HttpErrorShape {
  statusCode?: number;
  message?: string;
  userMessage?: string | null;
  code?: string;
  details?: string | null;
}

export function sendError(res: Response, error: HttpErrorShape | null | undefined): void {
  res.status(error && error.statusCode ? error.statusCode : 500).json({
    error: error && error.message ? error.message : "Unexpected server error",
    userMessage: error && error.userMessage ? error.userMessage : null,
    code: error && error.code ? error.code : "INTERNAL_ERROR",
    details: error && error.details ? error.details : null
  });
}
