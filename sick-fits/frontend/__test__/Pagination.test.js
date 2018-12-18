import { mount } from "enzyme";
import wait from "waait";
import toJSON from "enzyme-to-json";
import { MockedProvider } from "react-apollo/test-utils";
import Pagination, { PAGINATION_QUERY } from "../components/Pagination";

const makeMocksFor = length => [
  {
    request: { query: PAGINATION_QUERY, variables: { skip: 0, first: 4 } },
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

describe.skip("<Pagination />", () => {
  it("should render and display loading message", async () => {
    const wrapper = mount(
      <MockedProvider mocks={mock}>
        <Pagination page={1} />
      </MockedProvider>
    );
    // console.log(wrapper.debug());
    // await wait();
    // wrapper.update();
    // console.log(wrapper.debug());
  });
});
