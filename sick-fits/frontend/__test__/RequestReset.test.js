import { mount } from "enzyme";
import toJSON from "enzyme-to-json";
import wait from "waait";
import RequestReset, {
  REQUEST_RESET_MUTATION
} from "../components/RequestReset";
import { MockedProvider } from "react-apollo/test-utils";

const mocks = [
  {
    request: {
      query: REQUEST_RESET_MUTATION,
      variables: { email: "burfie@hotmail.com" }
    },
    result: {
      data: { requestReset: { message: "success", __typename: "Message" } }
    }
  }
];

describe("<RequestReset />", () => {
  it("should render", () => {
    const wrapper = mount(
      <MockedProvider mocks={mocks}>
        <RequestReset />
      </MockedProvider>
    );
    const form = wrapper.find("form[data-test='form']");
    expect(toJSON(form)).toMatchSnapshot();
  });

  it("should call the mutation", async () => {
    const wrapper = mount(
      <MockedProvider mocks={mocks}>
        <RequestReset />
      </MockedProvider>
    );
    // simulate typing an email
    wrapper.find("input").simulate("change", {
      target: { name: "email", value: "burfie@hotmail.com" }
    });
    wrapper.find("form").simulate("submit");
    await wait();
    await wait();
    wrapper.update();
    expect(wrapper.find("p").text()).toEqual(
      "Success! Check your email to change your password"
    );
  });
});
