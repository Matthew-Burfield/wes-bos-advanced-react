import React from "react";
import { Mutation } from "react-apollo";
import styled from "styled-components";
import PropTypes from "prop-types";
import gql from "graphql-tag";
import { CURRENT_USER_QUERY } from "./User";

const BigButton = styled.button`
  font-size: 3rem;
  background: none;
  border: 0;
  &:hover {
    color: ${props => props.theme.red};
    cursor: pointer;
  }
`;

const REMOVE_FROM_CART_MUTATION = gql`
  mutation REMOVE_FROM_CART_MUTATION($id: ID!) {
    removeFromCart(id: $id) {
      id
    }
  }
`;

const removeCartItem = (cart, cartItemId) => {
  return cart.filter(cartItem => cartItem.id !== cartItemId);
};

class RemoveFromCart extends React.Component {
  static propTypes = {
    id: PropTypes.string.isRequired
  };
  update = (cache, payload) => {
    console.log("Running update fn");
    const data = cache.readQuery({ query: CURRENT_USER_QUERY });
    const cartItemId = payload.data.removeFromCart.id;
    const updatedCart = removeCartItem(data.me.cart, cartItemId);
    cache.writeQuery({
      query: CURRENT_USER_QUERY,
      data: {
        me: {
          ...data.me,
          cart: updatedCart
        }
      }
    });
  };
  render() {
    return (
      <Mutation
        mutation={REMOVE_FROM_CART_MUTATION}
        variables={{ id: this.props.id }}
        update={this.update}
        optimisticResponse={{
          __typename: "Mutation",
          removeFromCart: {
            __typename: "CartItem",
            id: this.props.id
          }
        }}
      >
        {(removeFromCart, { error, loading }) => (
          <BigButton
            disabled={loading}
            title="Delete Item"
            onClick={() => removeFromCart().catch(err => alert(err.message))}
          >
            &times;
          </BigButton>
        )}
      </Mutation>
    );
  }
}

export default RemoveFromCart;
