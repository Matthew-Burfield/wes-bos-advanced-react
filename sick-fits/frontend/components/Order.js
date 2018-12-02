import React, { Component } from "react";
import PropTypes from "prop-types";
import { Query } from "react-apollo";
import gql from "graphql-tag";
import Head from "next/head";
import { format } from "date-fns";

import OrderStyles from "./styles/OrderStyles";
import { tabTitle } from "../config";
import formatMoney from "../lib/formatMoney";

const ORDER_QUERY = gql`
  query ORDER_QUERY($id: ID!) {
    order(id: $id) {
      id
      total
      charge
      createdAt
      user {
        id
        name
      }
      items {
        id
        title
        description
        image
        largeImage
        price
        quantity
      }
    }
  }
`;

class Order extends Component {
  static propTypes = {
    id: PropTypes.string.isRequired
  };
  render() {
    return (
      <Query query={ORDER_QUERY} variables={{ id: this.props.id }}>
        {({ data: { order }, error, loading }) => {
          if (error) <Error error={error} />;
          if (loading) <p>Loading...</p>;
          return (
            <OrderStyles>
              <Head>
                <title>
                  {tabTitle} - order {order.id}
                </title>
              </Head>
              <p>
                <span>Order ID</span>
                <span>{order.id}</span>
              </p>
              <p>
                <span>Charge</span>
                <span>{order.charge}</span>
              </p>
              <p>
                <span>Created at</span>
                <span>{format(order.createdAt, "MMMM d, yyyy a")}</span>
              </p>
              <p>
                <span>Total price</span>
                <span>{formatMoney(order.total)}</span>
              </p>
              <p>
                <span>Item count</span>
                <span>{order.items.length}</span>
              </p>
              <div className="items">
                {order.items.map(item => (
                  <div key={item.id} className="order-item">
                    <img src={item.image} alt={item.title} />
                    <div className="item-details">
                      <h2>{item.title}</h2>
                      <p>Qty: {item.quantity}</p>
                      <p>Each: {formatMoney(item.price)}</p>
                      <p>
                        Sub total: {formatMoney(item.price * item.quantity)}
                      </p>
                      <p>{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </OrderStyles>
          );
        }}
      </Query>
    );
  }
}

export default Order;
