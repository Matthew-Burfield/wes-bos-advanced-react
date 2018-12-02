import React, { Component } from "react";
import StripeCheckout from "react-stripe-checkout";
import { Mutation } from "react-apollo";
import Router from "next/router";
import NProgress from "nprogress";
import PropTypes from "prop-types";
import gql from "graphql-tag";
import calcTotalPrice from "../lib/calcTotalPrice";
import Error from "./ErrorMessage";
import User, { CURRENT_USER_QUERY } from "./User";

const totalItems = cart =>
  cart.reduce((tally, cartItem) => tally + cartItem.quantity, 0);

const CREATE_ORDER_MUTATION = gql`
  mutation CREATE_ORDER_MUTATION($token: String!) {
    createOrder(token: $token) {
      id
      total
      charge
    }
  }
`;

class TakeMyMoney extends Component {
  static propTypes = {
    children: PropTypes.node
  };
  handleToken = async (res, createOrder) => {
    NProgress.start();
    const order = await createOrder({
      variables: {
        token: res.id
      }
    }).catch(err => {
      alert(err);
    });
    Router.push({
      pathname: "/order",
      query: { id: order.data.createOrder.id }
    });
  };
  render() {
    return (
      <User>
        {({ data: { me } }) => (
          <Mutation
            mutation={CREATE_ORDER_MUTATION}
            refetchQueries={[{ query: CURRENT_USER_QUERY }]}
          >
            {createOrder => (
              <StripeCheckout
                amount={calcTotalPrice(me.cart)}
                name="Sick fits"
                description={`Order of ${totalItems(me.cart)} items`}
                image={
                  me.cart.length && me.cart[0].item && me.cart[0].item.image
                }
                stripeKey="pk_test_mK4rG6JeifvjAhFQDxSx4R1V"
                currency="AUD"
                email={me.email}
                token={res => this.handleToken(res, createOrder)}
              >
                {this.props.children}
              </StripeCheckout>
            )}
          </Mutation>
        )}
      </User>
    );
  }
}

export default TakeMyMoney;
