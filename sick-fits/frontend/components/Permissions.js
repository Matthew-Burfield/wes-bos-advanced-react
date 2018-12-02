import React, { Component } from "react";
import PropTypes from "prop-types";
import { Mutation, Query } from "react-apollo";
import gql from "graphql-tag";
import Error from "./ErrorMessage";
import Table from "./styles/Table";
import SickButton from "./styles/SickButton";

const ALL_USERS_QUERY = gql`
  query {
    users {
      id
      name
      email
      permissions
    }
  }
`;

const UPDATE_USER_MUTATION = gql`
  mutation UPDATE_USER_MUTATION($id: ID!, $permissions: [Permission]!) {
    updateUser(id: $id, permissions: $permissions) {
      id
      name
      email
      permissions
    }
  }
`;

const permissionsList = [
  "ADMIN",
  "USER",
  "EDITPERMISSIONS",
  "ITEMCREATE",
  "ITEMUPDATE",
  "ITEMDELETE"
];

const getUpdatedPermissions = ({ permissions, checked, value }) => {
  if (checked) {
    return [...permissions, value];
  }
  return permissions.filter(permission => permission !== value);
};

const Permissions = props => {
  return (
    <Query query={ALL_USERS_QUERY}>
      {({ data, error, loading }) => (
        <div>
          <Error error={error} />
          <Table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                {permissionsList.map(permission => (
                  <th key={permission}>{permission}</th>
                ))}
                <th>👇</th>
              </tr>
            </thead>
            <tbody>
              {data &&
                data.users &&
                data.users.map(user => <User key={user.id} user={user} />)}
            </tbody>
          </Table>
        </div>
      )}
    </Query>
  );
};

class User extends Component {
  static propTypes = {
    user: PropTypes.shape({
      name: PropTypes.string.isRequired,
      email: PropTypes.string.isRequired,
      id: PropTypes.string.isRequired,
      permissions: PropTypes.arrayOf(PropTypes.string).isRequired
    }).isRequired
  };
  state = {
    permissions: this.props.user.permissions
  };
  handleChange = e => {
    const checkbox = e.target;
    this.setState(prevState => ({
      permissions: getUpdatedPermissions({
        permissions: prevState.permissions,
        checked: checkbox.checked,
        value: checkbox.value
      })
    }));
  };
  render() {
    const { id, name, email } = this.props.user;
    return (
      <Mutation
        mutation={UPDATE_USER_MUTATION}
        variables={{
          id,
          permissions: this.state.permissions
        }}
      >
        {(updateUser, { error, loading }) => (
          <React.Fragment>
            {error && (
              <tr>
                <td colspan={9}>
                  <Error error={error} />
                </td>
              </tr>
            )}
            <tr>
              <td>{name}</td>
              <td>{email}</td>
              {permissionsList.map(permission => (
                <td key={permission}>
                  <label htmlFor={`${id}-permission-${permission}`}>
                    <input
                      id={`${id}-permission-${permission}`}
                      type="checkbox"
                      value={permission}
                      checked={this.state.permissions.includes(permission)}
                      onChange={this.handleChange}
                    />
                  </label>
                </td>
              ))}
              <td>
                <SickButton
                  type="button"
                  disabled={loading}
                  onClick={updateUser}
                >{`Updat${loading ? "ing" : "e"}`}</SickButton>
              </td>
            </tr>
          </React.Fragment>
        )}
      </Mutation>
    );
  }
}

export default Permissions;
