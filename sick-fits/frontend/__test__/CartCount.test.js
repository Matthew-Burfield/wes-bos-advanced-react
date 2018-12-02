import CartCount from "../components/CartCount";
import { shallow } from "enzyme";
import toJSON from "enzyme-to-json";

describe("<CartCount />", () => {
  it("should render", () => {
    shallow(<CartCount />);
  });

  it("should match the snapshot", () => {
    const wrapper = shallow(<CartCount />);
    expect(toJSON(wrapper)).toMatchSnapshot();
    wrapper.setProps({ count: 1 });
    expect(toJSON(wrapper)).toMatchSnapshot();
  });
});
