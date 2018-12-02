import React, { Component } from "react";
import { Mutation } from "react-apollo";
import gql from "graphql-tag";
import Router from "next/router";
import Form from "./styles/Form";
import formatMoney from "../lib/formatMoney";
import ErrorMessage from "./ErrorMessage";
import { ALL_ITEMS_QUERY } from "./Items";

const CREATE_ITEM_MUTATION = gql`
  mutation CREATE_ITEM_MUTATION(
    $title: String!
    $description: String!
    $price: Int!
    $image: String
    $largeImage: String
  ) {
    createItem(
      title: $title
      description: $description
      price: $price
      image: $image
      largeImage: $largeImage
    ) {
      id
      title
      description
      image
      largeImage
      price
    }
  }
`;

class CreateItem extends Component {
  state = {
    title: "",
    description: "",
    image: "",
    largeImage: "",
    price: "",
    imageLoading: false
  };
  handleOnChange = e => {
    const { name, type, value } = e.target;
    const val = type === "number" ? parseFloat(value) : value;
    this.setState({
      [name]: val
    });
  };
  uploadFile = e => {
    const { files } = e.target;
    this.setState({ imageLoading: true }, async () => {
      const data = new FormData();
      data.append("file", files[0]);
      data.append("upload_preset", "sickfits");
      const res = await fetch(
        "https://api.cloudinary.com/v1_1/ddo6rd9xt/image/upload",
        {
          method: "POST",
          body: data
        }
      );
      const file = await res.json();
      this.setState({
        image: file.secure_url,
        largeImage: file.eager[0].secure_url,
        imageLoading: false
      });
    });
  };
  update = (cache, { data: { createItem } }) => {
    const data = cache.readQuery({ query: ALL_ITEMS_QUERY });
    const items = [createItem, ...data.items];
    cache.writeQuery({
      query: ALL_ITEMS_QUERY,
      data: {
        items
      }
    });
  };
  render() {
    return (
      <Mutation
        mutation={CREATE_ITEM_MUTATION}
        variables={this.state}
        update={this.update}
      >
        {(createItem, { loading, error }) => (
          <Form
            onSubmit={async e => {
              e.preventDefault();
              if (!this.state.imageLoading) {
                const response = await createItem();
                Router.push({
                  pathname: "/item",
                  query: { id: response.data.createItem.id }
                });
              }
            }}
          >
            <ErrorMessage error={error} />
            <fieldset
              disabled={loading}
              aria-busy={loading || this.state.imageLoading}
            >
              <label htmlFor="file">
                Image
                <input
                  type="file"
                  id="file"
                  name="file"
                  placeholder="Upload an image"
                  required
                  onChange={this.uploadFile}
                />
                {this.state.image && (
                  <img src={this.state.image} alt="image preview" width={200} />
                )}
              </label>
              <label htmlFor="title">
                Title
                <input
                  type="text"
                  id="title"
                  name="title"
                  placeholder="Title"
                  required
                  value={this.state.title}
                  onChange={this.handleOnChange}
                />
              </label>
              <label htmlFor="price">
                Price
                <input
                  type="number"
                  id="price"
                  name="price"
                  placeholder="Price"
                  required
                  value={this.state.price}
                  onChange={this.handleOnChange}
                />
              </label>
              <label htmlFor="description">
                Description
                <textarea
                  id="description"
                  name="description"
                  placeholder="Enter a description"
                  required
                  value={this.state.description}
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

export default CreateItem;
export { CREATE_ITEM_MUTATION };
