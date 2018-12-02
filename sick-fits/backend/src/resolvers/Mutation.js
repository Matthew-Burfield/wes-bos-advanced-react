const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const stripe = require("stripe")(process.env.STRIPE_SECRET);
const { randomBytes } = require("crypto");
const { promisify } = require("util");
const { transport, makeANiceEmail } = require("../mail");
const { checkIsLoggedIn, hasPermission } = require("../utils");

const TOKEN_LENGTH = 3600000; // 1 hour

const createToken = userId => {
  return jwt.sign({ userId }, process.env.APP_SECRET);
};

const hash = value => {
  return bcrypt.hash(value, 15);
};

const getCookieArgs = token => [
  "token",
  token,
  {
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 * 365 // Will expire after 1 year
  }
];

const Mutations = {
  async createItem(parent, args, ctx, info) {
    const userId = checkIsLoggedIn(ctx);
    const item = await ctx.db.mutation.createItem(
      {
        data: {
          user: {
            connect: {
              id: userId
            }
          },
          ...args
        }
      },
      info
    );
    return item;
  },
  updateItem(parent, args, ctx, info) {
    const updates = { ...args };
    delete updates.id;
    return ctx.db.mutation.updateItem(
      {
        data: updates,
        where: { id: args.id }
      },
      info
    );
  },
  async deleteItem(parent, args, ctx, info) {
    const userId = checkIsLoggedIn(ctx);
    const where = { id: args.id };
    const item = await ctx.db.query.item(
      { where },
      `{
        id
        user {
          id
        }
      }`
    );
    const currentUser = await ctx.db.query.user(
      { where: { id: userId } },
      `{
        id
        permissions
      }`
    );
    if (item.user.id !== userId) {
      hasPermission(currentUser, ["ADMIN", "ITEMDELETE"]);
    }
    return ctx.db.mutation.deleteItem({ where }, info);
  },
  async signup(parent, args, ctx, info) {
    const email = args.email.toLowerCase();
    const password = await hash(args.password);
    const user = await ctx.db.mutation.createUser(
      {
        data: {
          ...args,
          email,
          password,
          permissions: { set: ["USER"] }
        }
      },
      info
    );
    const token = createToken(user.id);
    ctx.response.cookie(...getCookieArgs(token));
    return user;
  },
  async signin(parent, { email, password }, ctx, info) {
    const user = await ctx.db.query.user({ where: { email } });
    if (user && bcrypt.compare(password, user.password)) {
      const token = createToken(user.id);
      ctx.response.cookie(...getCookieArgs(token));
      return user;
    }
    throw new Error("Login details are incorrect");
  },
  signout(parent, args, ctx, info) {
    ctx.response.clearCookie("token");
    return {
      message: "Success"
    };
  },
  async requestReset(parent, args, ctx, info) {
    // 1. Check if this is a real user
    const user = await ctx.db.query.user({ where: { email: args.email } });
    if (!user) {
      throw new Error(`No such user found for email ${args.email}`);
    }
    // 2. Set a reset token and exprity on that user
    const randomBytesData = await promisify(randomBytes)(20);
    const resetToken = randomBytesData.toString("hex");
    const resetTokenExpiry = Date.now() + TOKEN_LENGTH;
    const res = await ctx.db.mutation.updateUser({
      where: { email: args.email },
      data: { resetToken, resetTokenExpiry }
    });
    // 3. Email them that reset token
    const mailResponse = await transport.sendMail({
      from: "matt@matt.com",
      to: user.email,
      subject: "Reset password",
      html: makeANiceEmail(
        `Your password reset token is here!\n\n<a href="${
          process.env.FRONTEND_URL
        }/reset?resetToken=${resetToken}">Click here to reset</a>`
      )
    });
    return { message: "Success" };
  },
  async resetPassword(parent, args, ctx, info) {
    if (args.password !== args.confirmPassword) {
      throw new Error(`Passwords don't match`);
    }
    const [user] = await ctx.db.query.users({
      where: {
        resetToken: args.token,
        resetTokenExpiry_gte: Date.now() - TOKEN_LENGTH
      }
    });
    if (!user) {
      throw new Error("The token is either invalid or has expired");
    }
    const password = await hash(args.password);
    const updatedUser = await ctx.db.mutation.updateUser({
      where: { id: user.id },
      data: { password, resetToken: null, resetTokenExpiry: null }
    });
    const token = createToken(updatedUser.id);
    ctx.response.cookie(...getCookieArgs(token));
    return updatedUser;
  },
  async updateUser(parent, args, ctx, info) {
    const userId = checkIsLoggedIn(ctx);
    const currentUser = await ctx.db.query.user(
      { where: { id: userId } },
      info
    );
    hasPermission(currentUser, ["ADMIN", "EDITPERMISSIONS"]);
    return ctx.db.mutation.updateUser(
      {
        data: {
          permissions: {
            set: args.permissions
          }
        },
        where: { id: args.id }
      },
      info
    );
  },
  async addToCart(parent, args, ctx, info) {
    // 1. Make sure they are signed in
    const userId = checkIsLoggedIn(ctx);
    // 2. Query the users current cart
    const [existingCartItem] = await ctx.db.query.cartItems({
      where: {
        user: { id: userId },
        item: { id: args.id }
      }
    });
    // 3. Check if that item is already in their cart and increment by 1 if it is
    if (existingCartItem) {
      return ctx.db.mutation.updateCartItem(
        {
          where: { id: existingCartItem.id },
          data: { quantity: existingCartItem.quantity + 1 }
        },
        info
      );
    }
    // 4. If it's not, create a fresh CartIte for that user
    return ctx.db.mutation.createCartItem(
      {
        data: {
          user: { connect: { id: userId } },
          item: { connect: { id: args.id } }
        }
      },
      info
    );
  },
  async removeFromCart(parent, args, ctx, info) {
    const userId = checkIsLoggedIn(ctx);
    const [cartItem] = await ctx.db.query.cartItems({
      where: { id: args.id, user: { id: userId } }
    });
    if (!cartItem) {
      throw new Error("No such item exists in your cart");
    }
    return ctx.db.mutation.deleteCartItem(
      {
        where: { id: args.id }
      },
      info
    );
  },
  async createOrder(parent, args, ctx, info) {
    // 1: Create the current user and make sure they are signed in
    const userId = checkIsLoggedIn(ctx);
    // 2: Recalculate the total for the prices
    const user = await ctx.db.query.user(
      { where: { id: userId } },
      `{
      id
      name
      email
      cart {
        id
        quantity
        item {
          id title price description image largeImage
        }
      }
    }`
    );
    const totalPrice = user.cart.reduce(
      (tally, cartItem) => tally + cartItem.quantity * cartItem.item.price,
      0
    );
    // // 3: Create the stripe charge
    const charge = await stripe.charges.create({
      amount: totalPrice,
      currency: "aud",
      description: "Sick fits order",
      source: args.token
    });
    // // 4: Convert the CartItems to OrderItems
    const orderItems = user.cart.map(cartItem => {
      const orderItem = {
        ...cartItem.item,
        quantity: cartItem.quantity,
        user: { connect: { id: userId } }
      };
      delete orderItem.id;
      return orderItem;
    });
    // 5: Create the Order
    const order = await ctx.db.mutation.createOrder({
      data: {
        total: charge.amount,
        charge: charge.id,
        items: { create: orderItems },
        user: { connect: { id: userId } }
      }
    });
    // 6: Clean up - clear the users cart, delete cartItems
    const cartItemIds = user.cart.map(cartItem => cartItem.id);
    await ctx.db.mutation.deleteManyCartItems({
      where: { id_in: cartItemIds }
    });
    // 7: Return the Order to the client
    return order;
  }
};

module.exports = Mutations;
