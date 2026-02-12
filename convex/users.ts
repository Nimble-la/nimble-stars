import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getBySupabaseId = query({
  args: { supabaseUserId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_supabase_id", (q) =>
        q.eq("supabaseUserId", args.supabaseUserId)
      )
      .unique();
  },
});

export const listByOrg = query({
  args: { orgId: v.id("organizations") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_org", (q) => q.eq("orgId", args.orgId))
      .collect();
  },
});

export const createClientUser = mutation({
  args: {
    email: v.string(),
    name: v.string(),
    orgId: v.id("organizations"),
    supabaseUserId: v.string(),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("users", {
      email: args.email,
      name: args.name,
      role: "client",
      orgId: args.orgId,
      supabaseUserId: args.supabaseUserId,
      isActive: true,
      createdAt: Date.now(),
    });
    return id;
  },
});

export const update = mutation({
  args: {
    userId: v.id("users"),
    name: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { userId, ...fields } = args;
    const updates: Record<string, string | boolean> = {};
    if (fields.name !== undefined) updates.name = fields.name;
    if (fields.isActive !== undefined) updates.isActive = fields.isActive;
    await ctx.db.patch(userId, updates);
  },
});
