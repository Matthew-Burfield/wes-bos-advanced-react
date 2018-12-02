import Item from "../components/Item";
import { fakeItem } from "../lib/testUtils";
import { shallow } from "enzyme";
import toJSON from "enzyme-to-json";

describe("<Item />", () => {
  const fakeItem = {
    title: "Test item",
    price: 5000,
    description: "This is the description of the fake item",
    image: "image.jpg",
    largeImage: "image-lg.jpg"
  };
  const wrapper = shallow(<Item item={fakeItem} />);

  it("should render", () => {
    expect(toJSON(wrapper)).toMatchSnapshot();
  });

  it("should render the title", () => {
    const Title = wrapper.find("Title");
    expect(Title).toBeDefined();
    expect(Title.find("a").text()).toEqual(fakeItem.title);
  });

  it("should render the PriceTag", () => {
    const PriceTag = wrapper.find("PriceTag");
    expect(PriceTag).toBeDefined();
    expect(PriceTag.dive().text()).toEqual("$50");
  });

  it("should render the image", () => {
    const img = wrapper.find("img");
    expect(img.props().src).toEqual(fakeItem.image);
    expect(img.props().alt).toEqual(fakeItem.title);
  });

  it("should render the AddToCart", () => {
    const AddToCart = wrapper.find("AddToCart");
    expect(AddToCart).toBeDefined();
  });

  it("should render the DeleteItem", () => {
    const DeleteItem = wrapper.find("DeleteItem");
    expect(DeleteItem).toBeDefined();
  });
});
