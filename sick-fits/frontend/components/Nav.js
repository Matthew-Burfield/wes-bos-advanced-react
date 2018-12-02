import Link from "next/link";
import { Mutation } from "react-apollo";
import NavStyles from "./styles/NavStyles";
import { LOCAL_STATE_MUTATION } from "./Cart";
import Signout from "./Signout";
import CartCount from "./CartCount";

const Nav = ({ currentUser }) => (
  <NavStyles>
    {currentUser && (
      <React.Fragment>
        <Link href="/items">
          <a>Shop</a>
        </Link>
        <Link href="/sell">
          <a>Sell</a>
        </Link>
        <Link href="/orders">
          <a>Orders</a>
        </Link>
        <Link href="/me">
          <a>Account</a>
        </Link>
        <Mutation mutation={LOCAL_STATE_MUTATION}>
          {toggleCart => (
            <button onClick={toggleCart}>
              My cart
              <CartCount
                count={currentUser.cart.reduce(
                  (tally, cartItem) => tally + cartItem.quantity,
                  0
                )}
              />
            </button>
          )}
        </Mutation>
        <Signout>Sign out</Signout>
      </React.Fragment>
    )}
    {!currentUser && (
      <Link href="/signup">
        <a>Signup</a>
      </Link>
    )}
  </NavStyles>
);

export default Nav;
