import React from 'react';
import { shallow } from 'enzyme';
import { assert } from 'chai';

import App from '../../src/js/components/App';

describe('<App />', () => {
    it('should render a hello message with `props.name`', () => {
        const wrapper = shallow(
            <App name="Gregory" />,
        );

        assert.isTrue(wrapper.contains(<h1>Hello, Gregory!</h1>));
    });
});
