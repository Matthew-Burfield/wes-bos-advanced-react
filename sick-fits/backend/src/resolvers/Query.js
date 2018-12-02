const { forwardTo } = require("prisma-binding");
const { checkIsLoggedIn, hasPermission } = require("../utils");

const Query = {
  items: forwardTo("db"),
  item: forwardTo("db"),
  itemsConnection: forwardTo("db"),
  me(parent, args, ctx, info) {
    const { userId } = ctx.response;
    if (!userId) {
      return null;
    }
    return ctx.db.query.user({ where: { id: userId } }, info);
  },
  async users(parent, args, ctx, info) {
    const userId = checkIsLoggedIn(ctx);
    const user = await ctx.db.query.user({ where: { id: userId } }, info);
    hasPermission(user, ["ADMIN", "EDITPERMISSIONS"]);
    return ctx.db.query.users({}, info);
  },
  async cartItem(parent, args, ctx, info) {
    const userId = checkIsLoggedIn(ctx);
    const [cartItem] = await ctx.db.query.cartItems(
      {
        where: {
          item: { id: args.itemId },
          user: { id: userId }
        }
      },
      info
    );
    return cartItem ? cartItem : null;
  },
  async order(parent, args, ctx, info) {
    const userId = checkIsLoggedIn(ctx);
    const order = await ctx.db.query.order({ where: { id: args.id } }, info);
    const currentUser = await ctx.db.query.user(
      { where: { id: userId } },
      `{
        id
        permissions
      }`
    );
    const ownsOrder = order.user.id === userId;
    const isAdmin = currentUser.permissions.includes("ADMIN");
    if (!ownsOrder && !isAdmin) {
      throw new Error("You do not have permission to view this order");
    }
    return order;
  },
  async myOrders(parent, args, ctx, info) {
    const userId = checkIsLoggedIn(ctx);
    return ctx.db.query.orders(
      {
        where: { user: { id: userId } }
      },
      info
    );
  }
};

module.exports = Query;
