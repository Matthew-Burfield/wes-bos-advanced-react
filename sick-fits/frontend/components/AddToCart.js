import React, { Component } from "react";
import { Mutation, Query } from "react-apollo";
import gql from "graphql-tag";
import { CURRENT_USER_QUERY } from "./User";

const ADD_TO_CART_MUTATION = gql`
  mutation ADD_TO_CART_MUTATION($id: ID!) {
    addToCart(id: $id) {
      id
      quantity
      item {
        id
        price
        image
        title
        description
      }
    }
  }
`;

const CART_ITEM_QUERY = gql`
  query CART_ITEM_QUERY($itemId: ID!) {
    cartItem(itemId: $itemId) {
      id
      quantity
      item {
        id
        price
        image
        title
        description
      }
    }
  }
`;

const updateCartItems = (cart, updatedCartItem) => {
  let foundItem = false;
  const updatedCart = cart.map(cartItem => {
    if (cartItem.id === updatedCartItem.id) {
      // This has come back from the server
      foundItem = true;
      return updatedCartItem;
    }
    if (
      updatedCartItem.id === "optimistic-response" &&
      cartItem.item.id === updatedCartItem.item.id
    ) {
      // This is the optimistic response
      foundItem = true;
      return {
        ...cartItem,
        quantity: cartItem.quantity + 1
      };
    }
    return cartItem;
  });
  if (foundItem) {
    return updatedCart;
  }
  return [...cart, updatedCartItem];
};

class AddToCart extends Component {
  update = (cache, payload) => {
    console.log("payload: ", payload);
    const data = cache.readQuery({ query: CURRENT_USER_QUERY });
    console.log("data", data);
    const result = {
      query: CURRENT_USER_QUERY,
      data: {
        me: {
          ...data.me,
          cart: updateCartItems(data.me.cart, payload.data.addToCart)
        }
      }
    };
    console.log("result: ", result);
    cache.writeQuery(result);
  };
  render() {
    const { item } = this.props;
    return (
      <Mutation
        mutation={ADD_TO_CART_MUTATION}
        variables={{ id: item.id }}
        update={this.update}
        optimisticResponse={{
          __typename: "Mutation",
          addToCart: {
            __typename: "CartItem",
            id: "optimistic-response",
            quantity: 1,
            item: {
              __typename: "Item",
              ...item
            }
          }
        }}
      >
        {(addToCart, { loading }) => (
          <button disabled={loading} onClick={addToCart}>
            Add{loading && "ing"} to cart 🛒
          </button>
        )}
      </Mutation>
    );
  }
}

export default AddToCart;
