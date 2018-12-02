import React, { Component } from "react";
import { Mutation } from "react-apollo";
import gql from "graphql-tag";
import Form from "./styles/Form";
import Error from "./ErrorMessage";
import { CURRENT_USER_QUERY } from "./User";

const SIGN_IN_MUTATION = gql`
  mutation SIGN_IN_MUTATION($email: String!, $password: String!) {
    signin(email: $email, password: $password) {
      id
      name
      email
      # permissions
    }
  }
`;

class Signin extends Component {
  state = {
    name: "",
    email: "",
    password: ""
  };
  handleOnChange = e => {
    const { name, value } = e.target;
    this.setState({
      [name]: value
    });
  };
  render() {
    return (
      <Mutation
        mutation={SIGN_IN_MUTATION}
        variables={this.state}
        refetchQueries={[{ query: CURRENT_USER_QUERY }]}
      >
        {(signin, { error, loading, data }) => (
          <Form
            method="post"
            onSubmit={async e => {
              e.preventDefault();
              await signin();
              this.setState({
                name: "",
                email: "",
                password: ""
              });
            }}
          >
            <fieldset disabled={loading} aria-busy={loading}>
              <h2>Sign in</h2>
              <Error error={error} />
              <label htmlFor="email">
                Email
                <input
                  // aria-autocomplete="username"
                  type="email"
                  id="email"
                  name="email"
                  placeholder="Email"
                  required
                  value={this.state.email}
                  onChange={this.handleOnChange}
                />
              </label>
              <label htmlFor="password">
                Password
                <input
                  aria-autocomplete="list"
                  type="password"
                  id="password"
                  name="password"
                  placeholder="Password"
                  required
                  value={this.state.password}
                  onChange={this.handleOnChange}
                />
              </label>
              <button type="submit">Submit</button>
            </fieldset>
          </Form>
        )}
      </Mutation>
    );
  }
}

export default Signin;
