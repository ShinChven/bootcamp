import { DefaultFooter } from '@ant-design/pro-layout';
import React, { PureComponent } from 'react';

class Footer extends PureComponent {
  render() {
    return (
      <DefaultFooter
        copyright={`${new Date().getFullYear()} ShinChven`}
        links={[
          {
            key: 'Ant Design Pro',
            title: '使用 Ant Design Pro 构建',
            href: 'https://pro.ant.design',
            blankTarget: true,
          },
          {
            key: 'Atlass.net',
            title: 'ShinChven',
            href: 'https://atlassc.net',
            blankTarget: true,
          },
        ]}
      />
    );
  }
}

export default Footer;
