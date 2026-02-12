import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: { search: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const candidates = await ctx.db.query("candidates").collect();

    const filtered = args.search
      ? candidates.filter((c) => {
          const term = args.search!.toLowerCase();
          return (
            c.fullName.toLowerCase().includes(term) ||
            (c.currentRole?.toLowerCase().includes(term) ?? false) ||
            (c.currentCompany?.toLowerCase().includes(term) ?? false)
          );
        })
      : candidates;

    const withCounts = await Promise.all(
      filtered.map(async (candidate) => {
        const cps = await ctx.db
          .query("candidatePositions")
          .withIndex("by_candidate", (q) => q.eq("candidateId", candidate._id))
          .collect();
        return { ...candidate, positionCount: cps.length };
      })
    );

    return withCounts;
  },
});

export const getById = query({
  args: { candidateId: v.id("candidates") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.candidateId);
  },
});

export const create = mutation({
  args: {
    fullName: v.string(),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    currentRole: v.optional(v.string()),
    currentCompany: v.optional(v.string()),
    summary: v.optional(v.string()),
    manatalUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const id = await ctx.db.insert("candidates", {
      fullName: args.fullName,
      email: args.email,
      phone: args.phone,
      currentRole: args.currentRole,
      currentCompany: args.currentCompany,
      summary: args.summary,
      manatalUrl: args.manatalUrl,
      createdAt: now,
      updatedAt: now,
    });
    return id;
  },
});

export const update = mutation({
  args: {
    candidateId: v.id("candidates"),
    fullName: v.optional(v.string()),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    currentRole: v.optional(v.string()),
    currentCompany: v.optional(v.string()),
    summary: v.optional(v.string()),
    manatalUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { candidateId, ...fields } = args;
    const updates: Record<string, string | number> = {};
    if (fields.fullName !== undefined) updates.fullName = fields.fullName;
    if (fields.email !== undefined) updates.email = fields.email;
    if (fields.phone !== undefined) updates.phone = fields.phone;
    if (fields.currentRole !== undefined) updates.currentRole = fields.currentRole;
    if (fields.currentCompany !== undefined) updates.currentCompany = fields.currentCompany;
    if (fields.summary !== undefined) updates.summary = fields.summary;
    if (fields.manatalUrl !== undefined) updates.manatalUrl = fields.manatalUrl;
    updates.updatedAt = Date.now();
    await ctx.db.patch(candidateId, updates);
  },
});
