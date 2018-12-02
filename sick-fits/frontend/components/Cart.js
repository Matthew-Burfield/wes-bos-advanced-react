import React from "react";
import { Query, Mutation } from "react-apollo";
import gql from "graphql-tag";
import CartStyles from "./styles/CartStyles";
import Supreme from "./styles/Supreme";
import CloseButton from "./styles/CloseButton";
import SickButton from "./styles/SickButton";
import { CURRENT_USER_QUERY } from "./User";
import CartItem from "./CartItem";
import TakeMyMoney from "./TakeMyMoney";
import calcTotalPrice from "../lib/calcTotalPrice";
import formatMoney from "../lib/formatMoney";

const LOCAL_STATE_QUERY = gql`
  query {
    cartOpen @client
  }
`;

const LOCAL_STATE_MUTATION = gql`
  mutation {
    toggleCart @client
  }
`;

const Cart = ({ currentUser }) => (
  <Mutation mutation={LOCAL_STATE_MUTATION}>
    {toggleCart => (
      <Query query={LOCAL_STATE_QUERY}>
        {({ data: { cartOpen } }) => (
          <CartStyles open={cartOpen}>
            <header>
              <CloseButton onClick={toggleCart}>&times;</CloseButton>
              <Supreme>{currentUser.name}'s cart</Supreme>
              <p>
                You have {currentUser.cart.length} item
                {currentUser.cart.length === 1 ? "" : "s"} in your cart
              </p>
            </header>
            <ul>
              {currentUser.cart.map(cartItem => (
                <CartItem key={cartItem.id} cartItem={cartItem} />
              ))}
            </ul>
            <footer>
              <p>{formatMoney(calcTotalPrice(currentUser.cart))}</p>
              {currentUser.cart.length > 0 && (
                <TakeMyMoney>
                  <SickButton>Checkout</SickButton>
                </TakeMyMoney>
              )}
            </footer>
          </CartStyles>
        )}
      </Query>
    )}
  </Mutation>
);

export default Cart;
export { LOCAL_STATE_QUERY, LOCAL_STATE_MUTATION };
