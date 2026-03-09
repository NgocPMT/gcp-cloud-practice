import Client from "./client";

const apiBaseUrl =
  typeof window === "undefined"
    ? process.env.INTERNAL_API_URL
    : process.env.NEXT_PUBLIC_API_URL;

export const encore = new Client(apiBaseUrl || "http://api.localhost");
