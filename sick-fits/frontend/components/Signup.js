import React, { Component } from "react";
import { Mutation } from "react-apollo";
import gql from "graphql-tag";
import Form from "./styles/Form";
import Error from "./ErrorMessage";
import { CURRENT_USER_QUERY } from "./User";

const SIGN_UP_MUTATION = gql`
  mutation SIGN_UP_MUTATION(
    $name: String!
    $email: String!
    $password: String!
  ) {
    signup(name: $name, email: $email, password: $password) {
      id
      name
      email
      permissions
    }
  }
`;

class Signup extends Component {
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
        mutation={SIGN_UP_MUTATION}
        variables={this.state}
        refetchQueries={[{ query: CURRENT_USER_QUERY }]}
      >
        {(signup, { error, loading, data }) => (
          <Form
            method="post"
            onSubmit={async e => {
              e.preventDefault();
              await signup();
              this.setState({
                name: "",
                email: "",
                password: ""
              });
            }}
          >
            <fieldset disabled={loading} aria-busy={loading}>
              <h2>Sign up for an account</h2>
              <Error error={error} />
              <label htmlFor="name">
                Name
                <input
                  type="text"
                  id="name"
                  name="name"
                  placeholder="Name"
                  required
                  value={this.state.name}
                  onChange={this.handleOnChange}
                />
              </label>
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

export default Signup;
