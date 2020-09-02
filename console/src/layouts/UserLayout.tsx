import { getMenuData, getPageTitle, MenuDataItem } from '@ant-design/pro-layout';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import Footer from '@/components/Footer';
import { connect, ConnectProps, useIntl } from 'umi';
import React from 'react';
import SelectLang from '@/components/SelectLang';
import { ConnectState } from '@/models/connect';
import styles from './UserLayout.less';

export interface UserLayoutProps extends Partial<ConnectProps> {
  breadcrumbNameMap: {
    [path: string]: MenuDataItem;
  };
}

const UserLayout: React.FC<UserLayoutProps> = (props) => {
  const {
    route = {
      routes: [],
    },
  } = props;
  const { routes = [] } = route;
  const {
    children,
    location = {
      pathname: '',
    },
  } = props;
  const { formatMessage } = useIntl();
  const { breadcrumb } = getMenuData(routes);
  const title = getPageTitle({
    pathname: location.pathname,
    formatMessage,
    breadcrumb,
    ...props,
  });
  return (
    <HelmetProvider>
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={title} />
      </Helmet>

      <div className={styles.container}>
        <div className={styles.lang}>
          <SelectLang />
        </div>
        <div className={styles.content}>
          <div className={styles.top}>
            <div className={styles.header}>
              <span className={styles.title}>atlassc bootcamp</span>
            </div>
            <div className={styles.desc}>ShinChven</div>
          </div>
          {children}
        </div>
        <Footer />
      </div>
    </HelmetProvider>
  );
};

export default connect(({ settings }: ConnectState) => ({ ...settings }))(UserLayout);
