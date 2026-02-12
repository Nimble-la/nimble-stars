import { query } from "./_generated/server";
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
