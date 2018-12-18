import { mount } from "enzyme";
import wait from "waait";
import toJSON from "enzyme-to-json";
import { MockedProvider } from "react-apollo/test-utils";
import Pagination, { PAGINATION_ITEMS_QUERY } from "../components/Pagination";
import Router from "next/router";

Router.router = {
  push() {},
  prefetch() {}
};

const makeMocksFor = length => [
  {
    request: { query: PAGINATION_ITEMS_QUERY },
    result: {
      data: {
        itemsConnection: {
          __typename: "aggregate",
          aggregate: {
            count: length,
            __typename: "count"
          }
        }
      }
    }
  }
];

describe("<Pagination />", () => {
  it("should render and display loading message", () => {
    const wrapper = mount(
      <MockedProvider mocks={makeMocksFor(1)}>
        <Pagination page={1} />
      </MockedProvider>
    );
    // const pagination = wrapper.find('[data-test="pagination"]')
    expect(wrapper.text()).toEqual("Loading...");
    // console.log(wrapper.debug());
    // await wait();
    // wrapper.update();
    // console.log(wrapper.debug());
  });

  it("renders pagination for 18 items", async () => {
    const wrapper = mount(
      <MockedProvider mocks={makeMocksFor(18)}>
        <Pagination page={1} />
      </MockedProvider>
    );
    await wait();
    wrapper.update();
    expect(wrapper.find(".totalPages").text()).toEqual("4");
    const pagination = wrapper.find('div[data-test="pagination"]');
    expect(toJSON(pagination)).toMatchSnapshot();
  });

  it("should disable prev button on the first page", async () => {
    const wrapper = mount(
      <MockedProvider mocks={makeMocksFor(18)}>
        <Pagination page={1} />
      </MockedProvider>
    );
    await wait();
    wrapper.update();
    expect(wrapper.find("a.prev").prop("aria-disabled")).toEqual(true);
  });

  it("should disable next button on the last page", async () => {
    const wrapper = mount(
      <MockedProvider mocks={makeMocksFor(18)}>
        <Pagination page={4} />
      </MockedProvider>
    );
    await wait();
    wrapper.update();
    expect(wrapper.find("a.next").prop("aria-disabled")).toEqual(true);
  });

  it("should enable both buttons on a middle page", async () => {
    const wrapper = mount(
      <MockedProvider mocks={makeMocksFor(18)}>
        <Pagination page={3} />
      </MockedProvider>
    );
    await wait();
    wrapper.update();
    expect(wrapper.find("a.prev").prop("aria-disabled")).toEqual(false);
    expect(wrapper.find("a.next").prop("aria-disabled")).toEqual(false);
  });
});
