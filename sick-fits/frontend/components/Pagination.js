import React from "react";
import { Query } from "react-apollo";
import gql from "graphql-tag";
import Head from "next/head";
import Link from "next/link";
import { perPage, tabTitle } from "../config";
import PaginationStyles from "./styles/PaginationStyles";

const PAGINATION_ITEMS_QUERY = gql`
  query PAGINATION_ITEMS_QUERY {
    itemsConnection {
      aggregate {
        count
      }
    }
  }
`;

const Pagination = props => (
  <Query query={PAGINATION_ITEMS_QUERY}>
    {({ data, error, loading }) => {
      if (error) return <Error error={error} />;
      if (loading) return <p>Loading....</p>;
      const itemCount = data.itemsConnection.aggregate.count;
      const totalPages = Math.ceil(itemCount / perPage);
      return (
        <PaginationStyles>
          <Head>
            <title>
              {tabTitle} - page {props.page} of {totalPages}
            </title>
          </Head>
          <Link
            prefetch
            href={{
              pathname: "items",
              query: { page: props.page - 1 }
            }}
          >
            <a className="prev" aria-disabled={props.page <= 1}>
              ← Prev
            </a>
          </Link>
          <p>
            Page {props.page} of {totalPages}
          </p>
          <p>{itemCount} items total</p>
          <Link
            prefetch
            href={{
              pathname: "items",
              query: { page: props.page + 1 }
            }}
          >
            <a className="next" aria-disabled={props.page >= totalPages}>
              Next →
            </a>
          </Link>
        </PaginationStyles>
      );
    }}
  </Query>
);

export default Pagination;
export { PAGINATION_ITEMS_QUERY };
