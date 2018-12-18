import { mount } from "enzyme";
import toJSON from "enzyme-to-json";
import { MockedProvider } from "react-apollo/test-utils";
import Nav from "../components/Nav";
import { fakeUser, fakeCartItem } from "../lib/testUtils";

describe("<Nav />", () => {
  it("renders a minimal nav when signed out", () => {
    const wrapper = mount(
      <MockedProvider mocks={[]}>
        <Nav />
      </MockedProvider>
    );
    expect(toJSON(wrapper.find("ul[data-test='nav']"))).toMatchSnapshot();
  });

  it("renders full nav when logged in", () => {
    const wrapper = mount(
      <MockedProvider mocks={[]}>
        <Nav currentUser={fakeUser()} />
      </MockedProvider>
    );
    // expect(toJSON(wrapper.find("ul[data-test='nav']"))).toMatchSnapshot();
    const nav = wrapper.find("ul[data-test='nav']");
    expect(nav.children().length).toEqual(6);
    expect(nav.text()).toContain("Shop");
    expect(nav.text()).toContain("Sell");
    expect(nav.text()).toContain("Orders");
    expect(nav.text()).toContain("Account");
    expect(nav.text()).toContain("My cart");
    expect(nav.text()).toContain("Sign out");
  });

  it("renders the amount of items in the cart", () => {
    const userWithCartItems = {
      ...fakeUser(),
      cart: [fakeCartItem(), fakeCartItem(), fakeCartItem()]
    };
    const wrapper = mount(
      <MockedProvider mocks={[]}>
        <Nav currentUser={userWithCartItems} />
      </MockedProvider>
    );
    // expect(toJSON(wrapper.find("[data-test='nav']"))).toMatchSnapshot();
    const nav = wrapper.find("ul[data-test='nav']");
    const count = nav.find("div.count");
    expect(toJSON(count)).toMatchSnapshot();
  });
});
