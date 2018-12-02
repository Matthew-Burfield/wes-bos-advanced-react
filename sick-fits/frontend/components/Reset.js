import React, { Component } from "react";
import PropTypes from "prop-types";
import { Mutation } from "react-apollo";
import gql from "graphql-tag";
import Form from "./styles/Form";
import Error from "./ErrorMessage";
import { CURRENT_USER_QUERY } from "./User";

const RESET_MUTATION = gql`
  mutation RESET_MUTATION(
    $resetToken: String!
    $password: String!
    $confirmPassword: String!
  ) {
    resetPassword(
      resetToken: $resetToken
      password: $password
      confirmPassword: $confirmPassword
    ) {
      id
      email
      name
    }
  }
`;

class Reset extends Component {
  static propTypes = {
    resetToken: PropTypes.string.isRequired
  };
  state = {
    password: "",
    confirmPassword: ""
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
        mutation={RESET_MUTATION}
        variables={{
          resetToken: this.props.resetToken,
          ...this.state
        }}
        refetchQueries={[
          {
            query: CURRENT_USER_QUERY
          }
        ]}
      >
        {(requestReset, { error, loading, called }) => (
          <Form
            method="post"
            onSubmit={async e => {
              e.preventDefault();
              await requestReset();
              this.setState({
                password: "",
                confirmPassword: ""
              });
            }}
          >
            <fieldset disabled={loading} aria-busy={loading}>
              <h2>Reset password</h2>
              <Error error={error} />
              <label htmlFor="password">
                Password
                <input
                  // aria-autocomplete="username"
                  type="password"
                  id="password"
                  name="password"
                  placeholder="password"
                  required
                  value={this.state.password}
                  onChange={this.handleOnChange}
                />
              </label>
              <label htmlFor="confirmPassword">
                Confirm password
                <input
                  // aria-autocomplete="username"
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  placeholder="confirmPassword"
                  required
                  value={this.state.confirmPassword}
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

export default Reset;
