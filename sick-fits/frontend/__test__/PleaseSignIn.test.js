import { mount } from "enzyme";
import toJSON from "enzyme-to-json";
import wait from "waait";
import PleaseSignIn from "../components/PleaseSignIn";
import Signin from "../components/Signin";
import { CURRENT_USER_QUERY } from "../components/User";
import { MockedProvider } from "react-apollo/test-utils";
import { fakeUser } from "../lib/testUtils";

describe("<PleaseSignIn />", () => {
  it("should should render the sign in when not logged in", async () => {
    const mocks = [
      {
        request: { query: CURRENT_USER_QUERY },
        result: { data: { me: null } }
      }
    ];
    const wrapper = mount(
      <MockedProvider mocks={mocks}>
        <PleaseSignIn>
          <p>Secret</p>
        </PleaseSignIn>
      </MockedProvider>
    );
    expect(wrapper.text()).toContain("Loading...");
    await wait();
    wrapper.update();
    const pleaseSignIn = wrapper.find("PleaseSignIn");
    expect(pleaseSignIn.contains(<Signin />)).toBeTruthy();
    expect(pleaseSignIn.text()).not.toContain("Secret");
    console.log(toJSON(pleaseSignIn));
    // expect(toJSON(pleaseSignIn)).toMatchSnapshot();
  });

  it("should render the children if signed in", async () => {
    const mocks = [
      {
        request: { query: CURRENT_USER_QUERY },
        result: { data: { me: fakeUser() } }
      }
    ];
    const wrapper = mount(
      <MockedProvider mocks={mocks}>
        <PleaseSignIn>
          <p>Secret</p>
        </PleaseSignIn>
      </MockedProvider>
    );
    await wait();
    wrapper.update();
    const pleaseSignIn = wrapper.find("PleaseSignIn");
    expect(pleaseSignIn.contains(<Signin />)).toBeFalsy();
    expect(pleaseSignIn.text()).toEqual("Secret");
    // expect(toJSON(pleaseSignIn)).toMatchSnapshot();
  });
});
