import { query } from "./_generated/server";

export const countAll = query({
  args: {},
  handler: async (ctx) => {
    const cps = await ctx.db.query("candidatePositions").collect();
    return cps.length;
  },
});
