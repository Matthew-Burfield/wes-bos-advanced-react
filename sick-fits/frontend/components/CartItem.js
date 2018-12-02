import React from "react";
import PropTypes from "prop-types";
import styled from "styled-components";
import formatMoney from "../lib/formatMoney";
import RemoveFromCart from "./RemoveFromCart";

const CartItemStyles = styled.li`
  padding: 1rem 0;
  border-bottom: 1px solid ${props => props.theme.lightgrey};
  display: grid;
  align-items: center;
  grid-template-columns: auto 1fr auto;
  img {
    margin-right: 10px;
  }
  h3,
  p {
    margin: 0;
  }
`;

const CartItem = ({ cartItem }) => {
  if (!cartItem.item) {
    return (
      <CartItemStyles>
        <p>This item has been deleted</p>
        <RemoveFromCart id={cartItem.id} />
      </CartItemStyles>
    );
  }
  const { title, price, description, image } = cartItem.item;
  return (
    <CartItemStyles>
      <img width="100" src={image} alt={title} />
      <div className=".cart-item-details">
        <h3>{title}</h3>
        <p>
          {formatMoney(price * cartItem.quantity)}
          {" - "}
          <em>{cartItem.quantity}</em> &times; {formatMoney(price)} each
        </p>
      </div>
      <RemoveFromCart id={cartItem.id} />
    </CartItemStyles>
  );
};

CartItem.propTypes = {
  cartItem: PropTypes.object.isRequired
};

export default CartItem;
