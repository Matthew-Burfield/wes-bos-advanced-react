import { Query } from "react-apollo";
import PropTypes from "prop-types";
import { CURRENT_USER_QUERY } from "./User";
import Signin from "./Signin";
import Error from "./ErrorMessage";

const PleaseSignIn = ({ children }) => (
  <Query query={CURRENT_USER_QUERY}>
    {({ data: { me }, error, loading }) => {
      if (loading) return <p>Loading...</p>;
      if (error) return <Error error={error} />;
      if (me) {
        return children;
      }
      return <Signin />;
    }}
  </Query>
);

PleaseSignIn.propTypes = {
  children: PropTypes.element.isRequired
};

export default PleaseSignIn;
