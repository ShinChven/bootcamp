import {LockTwoTone, UserOutlined,} from '@ant-design/icons';
import {Alert, message} from 'antd';
import React, {useEffect, useState} from 'react';
import ProForm, {ProFormText} from '@ant-design/pro-form';
import {FormattedMessage, history, Link, SelectLang, useIntl, useModel} from 'umi';
import Footer from '@/components/Footer';

import styles from './index.less';
import type {IAuthenticateParams, IAuthenticationResponse} from "@/services/authentication";
import {authenticate, reAuthenticate} from "@/services/authentication";
import {authStorageKey} from "@/services/client";

const LoginMessage: React.FC<{
  content: string;
}> = ({content}) => (
  <Alert
    style={{
      marginBottom: 24,
    }}
    message={content}
    type="error"
    showIcon
  />
);

/**
 * 此方法会跳转到 redirect 参数所在的位置
 */
const goto = () => {
  if (!history) return;
  setTimeout(() => {
    const {query} = history.location;
    const {redirect} = query as { redirect: string };
    history.push(redirect || '/');
  }, 10);
};

const Login: React.FC = () => {
  const accessToken = localStorage.getItem(authStorageKey)
  const [reAuthenticating, setReAuthenticating] = useState(accessToken !== null);
  const [submitting, setSubmitting] = useState(false);
  const [userLoginState, setUserLoginState] = useState<API.LoginStateType>({});
  const {initialState, setInitialState} = useModel('@@initialState');

  const intl = useIntl();

  const handleSubmit = async (values: IAuthenticateParams) => {
    setSubmitting(true);

    try {
      // 登录
      const response = (await authenticate(values)) as IAuthenticationResponse;
      if (response?.user?.id && response.user.id > 0) {
        message.success('登录成功！');
        setInitialState({
          ...initialState,
          currentUser: response.user,
        });
        goto();
      } else {
        setUserLoginState({status: 'error', type: 'account'});
      }

      // 如果失败去设置用户错误信息
    } catch (error) {
      message.error('登录失败，请重试！');
    }
    setSubmitting(false);
  };
  const {status, type: loginType} = userLoginState;

  useEffect(() => {

    if (accessToken) {
      reAuthenticate().then(authResp => {
        if (authResp?.user?.id && authResp.user.id > 0) {
          setInitialState({
            ...initialState,
            currentUser: authResp.user,
          });
          goto();
        }
        // eslint-disable-next-line no-console
      }).catch(() => {
        setReAuthenticating(false);
      });
    }
  }, [accessToken]);

  if (reAuthenticating) {
    return <></>
  }

  return (
    <div className={styles.container}>
      <div className={styles.lang}>{SelectLang && <SelectLang/>}</div>
      <div className={styles.content}>
        <div className={styles.top}>
          <div className={styles.header}>
            <Link to="/">
              <span className={styles.title}>Bootcamp</span>
            </Link>
          </div>
          <div className={styles.desc}>登录</div>
        </div>

        <div className={styles.main}>
          <ProForm
            initialValues={{
              autoLogin: true,
            }}
            submitter={{
              searchConfig: {
                submitText: intl.formatMessage({
                  id: 'pages.login.submit',
                  defaultMessage: '登录',
                }),
              },
              render: (_, dom) => dom.pop(),
              submitButtonProps: {
                loading: submitting,
                size: 'large',
                style: {
                  width: '100%',
                },
              },
            }}
            onFinish={async (values) => {
              await handleSubmit(values as IAuthenticateParams);
            }}
          >
            {status === 'error' && loginType === 'account' && (
              <LoginMessage
                content={intl.formatMessage({
                  id: 'pages.login.accountLogin.errorMessage',
                  defaultMessage: '账户或密码错误（admin/ant.design)',
                })}
              />
            )}
            <>
              <ProFormText
                name="email"
                fieldProps={{
                  size: 'large',
                  prefix: <UserOutlined className={styles.prefixIcon}/>,
                }}
                placeholder={intl.formatMessage({
                  id: 'pages.login.username.placeholder',
                  defaultMessage: '用户名: admin or user',
                })}
                rules={[
                  {
                    required: true,
                    message: (
                      <FormattedMessage
                        id="pages.login.username.required"
                        defaultMessage="请输入用户名!"
                      />
                    ),
                  },
                ]}
              />
              <ProFormText.Password
                name="password"
                fieldProps={{
                  size: 'large',
                  prefix: <LockTwoTone className={styles.prefixIcon}/>,
                }}
                placeholder={intl.formatMessage({
                  id: 'pages.login.password.placeholder',
                  defaultMessage: '密码: ant.design',
                })}
                rules={[
                  {
                    required: true,
                    message: (
                      <FormattedMessage
                        id="pages.login.password.required"
                        defaultMessage="请输入密码！"
                      />
                    ),
                  },
                ]}
              />
            </>
            <div
              style={{
                marginBottom: 24,
              }}
            >
            </div>
          </ProForm>
        </div>
      </div>
      <Footer/>
    </div>
  );
};

export default Login;
