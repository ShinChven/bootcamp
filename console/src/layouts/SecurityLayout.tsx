import React from 'react';
import { PageLoading } from '@ant-design/pro-layout';
import { connect, ConnectProps, Redirect } from 'umi';
import { stringify } from 'querystring';
import { ConnectState } from '@/models/connect';
import { isLocalTokenValid, User } from '@/models/authentication';
import { message } from 'antd';

interface SecurityLayoutProps extends ConnectProps {
  loading?: boolean;
  currentUser?: User;
}

interface SecurityLayoutState {
  isReady: boolean;
}

class SecurityLayout extends React.Component<SecurityLayoutProps, SecurityLayoutState> {
  state: SecurityLayoutState = {
    isReady: false, // 页面默认为加载状态，等待验证用户是否已经认证成功。
  };

  componentDidMount() {
    const { dispatch, currentUser = { id: 0 } } = this.props;
    // @ts-ignore
    if (currentUser.id > 0) {
      // 如果 AuthenticationModel 中已经有认证信息，
      this.setState({
        // 设置页面可用
        isReady: true,
      });
    } else {
      // 登录后重新打开页面，比如刷新页面，此时 AuthenticationModel 不包含认证信息。
      // 判断本地 token 是否已经过期。
      if (isLocalTokenValid()) {
        // 如果未过期
        if (typeof dispatch === 'function') {
          dispatch({ type: 'authentication/reAuthentication' }); // 刷新 token，如果刷新成功，将在本组件的 componentWillReceiveProps 方法中更页面加载状态
          return;
        }
        message.error('出错啦');
        return;
      }
      if (typeof dispatch === 'function') {
        dispatch({ type: 'authentication/logout' });
      }
    }
  }

  componentWillReceiveProps(nextProps: Readonly<SecurityLayoutProps>) {
    const { currentUser = { id: 0 } } = nextProps;
    const { isReady } = this.state;
    // @ts-ignore
    if (!isReady && currentUser.id > 0) {
      // 重新认证成功后，更改页面加载状态。
      this.setState({ isReady: true });
    }
  }

  render() {
    const { isReady } = this.state;
    const { children, loading, currentUser } = this.props;
    // You can replace it to your authentication rule (such as check token exists)
    // 你可以把它替换成你自己的登录认证规则（比如判断 token 是否存在）
    const isLogin = currentUser && currentUser.id;

    if ((!isLogin && loading) || !isReady) {
      return <PageLoading />;
    }

    const queryString = stringify({
      redirect: window.location.href,
    });

    if (!isLogin && window.location.pathname !== '/user/login') {
      return <Redirect to={`/user/login?${queryString}`} />;
    }
    return children;
  }
}

export default connect((state: ConnectState) => {
  const { authentication, loading } = state;
  return {
    currentUser: authentication.user,
    loading: loading.models.user,
  };
})(SecurityLayout);
