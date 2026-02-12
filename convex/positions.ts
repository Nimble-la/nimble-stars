import { query } from "./_generated/server";

export const countOpen = query({
  args: {},
  handler: async (ctx) => {
    const positions = await ctx.db.query("positions").collect();
    return positions.filter((p) => p.status === "open").length;
  },
});
