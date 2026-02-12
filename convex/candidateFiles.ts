import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const listByCandidate = query({
  args: { candidateId: v.id("candidates") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("candidateFiles")
      .withIndex("by_candidate", (q) => q.eq("candidateId", args.candidateId))
      .collect();
  },
});

export const create = mutation({
  args: {
    candidateId: v.id("candidates"),
    fileUrl: v.string(),
    fileName: v.string(),
    fileType: v.string(),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("candidateFiles", {
      candidateId: args.candidateId,
      fileUrl: args.fileUrl,
      fileName: args.fileName,
      fileType: args.fileType,
      uploadedAt: Date.now(),
    });
    return id;
  },
});
