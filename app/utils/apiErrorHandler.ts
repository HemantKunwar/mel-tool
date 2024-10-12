// app/utils/apiErrorHandler.ts

import { json } from "@remix-run/node";

export function handleApiError(error: unknown) {
  console.error("API Error:", error);
  if (error instanceof Error) {
    return json({ error: error.message }, { status: 500 });
  }
  return json({ error: "An unexpected error occurred" }, { status: 500 });
}