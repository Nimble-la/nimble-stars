import { action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";
import type { Id } from "./_generated/dataModel";

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

// --- Import flow ---

interface ManatalEducation {
  degree: string | null;
  school: string | null;
  end_date: string | null;
}

interface ManatalExperience {
  title: string | null;
  company: string | null;
  start_date: string | null;
  end_date: string | null;
  is_current: boolean;
}

function buildSummary(
  description: string | null,
  educations: ManatalEducation[],
  experiences: ManatalExperience[]
): string {
  const parts: string[] = [];

  if (description?.trim()) {
    parts.push(description.trim());
  }

  if (educations.length > 0) {
    const eduLines = educations
      .map((e) => {
        const degree = e.degree || "Degree";
        const school = e.school || "Unknown";
        const year = e.end_date ? e.end_date.slice(0, 4) : "";
        return year
          ? `${degree} at ${school} (${year})`
          : `${degree} at ${school}`;
      })
      .join("\n");
    parts.push(`Education:\n${eduLines}`);
  }

  if (experiences.length > 0) {
    const expLines = experiences
      .map((e) => {
        const title = e.title || "Role";
        const company = e.company || "Company";
        const start = e.start_date ? e.start_date.slice(0, 7) : "";
        const end = e.is_current
          ? "Present"
          : e.end_date
            ? e.end_date.slice(0, 7)
            : "";
        const period =
          start && end ? ` (${start} - ${end})` : start ? ` (${start})` : "";
        return `${title} at ${company}${period}`;
      })
      .join("\n");
    parts.push(`Experience:\n${expLines}`);
  }

  return parts.join("\n\n");
}

async function uploadResumeToSupabase(
  resumeUrl: string,
  candidateId: string
): Promise<string | null> {
  const supabaseUrl = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.warn("Supabase credentials not configured, skipping resume upload");
    return null;
  }

  try {
    // Download resume from Manatal
    const response = await fetch(resumeUrl);
    if (!response.ok) return null;

    const fileBuffer = await response.arrayBuffer();
    const contentType = response.headers.get("content-type") || "application/pdf";
    const ext = contentType.includes("pdf") ? "pdf" : "doc";
    const storagePath = `files/${candidateId}/resume.${ext}`;

    // Upload to Supabase Storage
    const uploadResponse = await fetch(
      `${supabaseUrl}/storage/v1/object/candidate-files/${storagePath}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${supabaseKey}`,
          "Content-Type": contentType,
          "x-upsert": "true",
        },
        body: fileBuffer,
      }
    );

    if (!uploadResponse.ok) {
      console.warn("Failed to upload resume to Supabase:", uploadResponse.status);
      return null;
    }

    // Return public URL
    return `${supabaseUrl}/storage/v1/object/public/candidate-files/${storagePath}`;
  } catch (err) {
    console.warn("Resume upload failed:", err);
    return null;
  }
}

export const importCandidate = action({
  args: { manatalId: v.number() },
  handler: async (ctx, args) => {
    // 1. Check duplicate
    const existing = await ctx.runQuery(api.candidates.getByManatalId, {
      manatalId: args.manatalId,
    });
    if (existing) {
      throw new Error("This candidate has already been imported");
    }

    const apiKey = getApiKey();

    // 2-4. Fetch candidate, educations, experiences in parallel
    const [candidateRes, educationsRes, experiencesRes] = await Promise.all([
      manatalFetch(`/candidates/${args.manatalId}/`, apiKey),
      manatalFetch(`/candidates/${args.manatalId}/educations/`, apiKey),
      manatalFetch(`/candidates/${args.manatalId}/experiences/`, apiKey),
    ]);

    const candidate = await candidateRes.json();
    const educationsData = await educationsRes.json();
    const experiencesData = await experiencesRes.json();

    const educations: ManatalEducation[] = educationsData.results ?? educationsData ?? [];
    const experiences: ManatalExperience[] = experiencesData.results ?? experiencesData ?? [];

    // 5. Build summary
    const summary = buildSummary(candidate.description, educations, experiences);

    // 6-7. Create candidate in Convex
    const candidateId: Id<"candidates"> = await ctx.runMutation(api.candidates.create, {
      fullName: candidate.full_name || "Unknown",
      email: candidate.email || undefined,
      phone: candidate.phone_number || undefined,
      currentRole: candidate.current_position || undefined,
      currentCompany: candidate.current_company || undefined,
      summary: summary || undefined,
      manatalUrl: `https://app.manatal.com/candidates/${args.manatalId}`,
      manatalId: args.manatalId,
      manatalImportedAt: Date.now(),
    });

    // 8. Download and upload resume if available
    if (candidate.resume) {
      const fileUrl = await uploadResumeToSupabase(
        candidate.resume,
        candidateId
      );
      if (fileUrl) {
        await ctx.runMutation(api.candidateFiles.create, {
          candidateId,
          fileUrl,
          fileName: "resume.pdf",
          fileType: "application/pdf",
        });
      }
    }

    return { candidateId, success: true };
  },
});
