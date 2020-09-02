import { Alert } from 'antd';
import React, { useState } from 'react';
import { connect, Dispatch } from 'umi';
import { LoginParamsType } from '@/services/login';
import { ConnectState } from '@/models/connect';
import { AuthenticationState } from '@/models/authentication';
import LoginForm from './components/Login';

import styles from './style.less';

const { Tab, UserName, Password, Submit } = LoginForm;

interface LoginProps {
  dispatch: Dispatch;
  authentication: AuthenticationState;
  submitting?: boolean;
}

const LoginMessage: React.FC<{
  content: string;
}> = ({ content }) => (
  <Alert
    style={{
      marginBottom: 24,
    }}
    message={content}
    type="error"
    showIcon
  />
);

const Login: React.FC<LoginProps> = (props) => {
  const { authentication, submitting } = props;
  const { errorMessage } = authentication;
  const [type, setType] = useState<string>('account');

  const handleSubmit = async (values: LoginParamsType) => {
    const { dispatch } = props;
    dispatch({
      type: 'authentication/authentication',
      payload: values,
    });
  };

  return (
    <div className={styles.main}>
      <LoginForm activeKey={type} onTabChange={setType} onSubmit={handleSubmit}>
        <Tab key="account" tab="账户密码登录">
          {typeof errorMessage === 'string' && errorMessage.length > 0 && !submitting && (
            <LoginMessage content={errorMessage} />
          )}
          <UserName
            name="email"
            placeholder="请输入邮箱"
            rules={[
              {
                required: true,
                message: '请输入邮箱!',
              },
            ]}
          />
          <Password
            name="password"
            placeholder="请输入密码"
            rules={[
              {
                required: true,
                message: '请输入密码！',
              },
            ]}
          />
        </Tab>
        <a>忘记密码</a>
        <Submit loading={submitting}>登录</Submit>
      </LoginForm>
    </div>
  );
};

export default connect(({ authentication, loading }: ConnectState) => ({
  authentication,
  submitting: loading.effects['authentication/authentication'],
}))(Login);
