import { action } from "./_generated/server";
import { v } from "convex/values";

const MANATAL_BASE_URL = "https://api.manatal.com/open/v3";

async function manatalFetch(path: string, apiKey: string): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(`${MANATAL_BASE_URL}${path}`, {
      headers: {
        Authorization: `Token ${apiKey}`,
        "Content-Type": "application/json",
      },
      signal: controller.signal,
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Invalid Manatal API key");
      }
      if (response.status === 404) {
        throw new Error("Candidate not found in Manatal");
      }
      if (response.status === 429) {
        throw new Error("Rate limited by Manatal, try again later");
      }
      throw new Error(`Manatal API error: ${response.status}`);
    }

    return response;
  } catch (err) {
    if (err instanceof Error) {
      if (err.name === "AbortError") {
        throw new Error("Manatal API request timed out");
      }
      throw err;
    }
    throw new Error("Could not connect to Manatal");
  } finally {
    clearTimeout(timeout);
  }
}

function getApiKey(): string {
  const key = process.env.MANATAL_API_KEY;
  if (!key) {
    throw new Error("MANATAL_API_KEY environment variable is not configured");
  }
  return key;
}

export const search = action({
  args: {
    query: v.string(),
    page: v.optional(v.number()),
    pageSize: v.optional(v.number()),
  },
  handler: async (_ctx, args) => {
    const apiKey = getApiKey();
    const page = args.page ?? 1;
    const pageSize = args.pageSize ?? 10;

    const params = new URLSearchParams({
      full_name: args.query,
      case_insensitive: "true",
      page: String(page),
      page_size: String(pageSize),
    });

    const response = await manatalFetch(
      `/candidates/?${params.toString()}`,
      apiKey
    );
    return await response.json();
  },
});

export const getCandidate = action({
  args: { manatalId: v.number() },
  handler: async (_ctx, args) => {
    const apiKey = getApiKey();
    const response = await manatalFetch(
      `/candidates/${args.manatalId}/`,
      apiKey
    );
    return await response.json();
  },
});

export const getCandidateEducations = action({
  args: { manatalId: v.number() },
  handler: async (_ctx, args) => {
    const apiKey = getApiKey();
    const response = await manatalFetch(
      `/candidates/${args.manatalId}/educations/`,
      apiKey
    );
    return await response.json();
  },
});

export const getCandidateExperiences = action({
  args: { manatalId: v.number() },
  handler: async (_ctx, args) => {
    const apiKey = getApiKey();
    const response = await manatalFetch(
      `/candidates/${args.manatalId}/experiences/`,
      apiKey
    );
    return await response.json();
  },
});
