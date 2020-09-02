// 认证 models ，管理整个程序的生命周期内的用户认证、重新认证、用户信息存储等

import {Effect, Reducer} from '@@/plugin-dva/connect';
import {setAuthority} from '@/utils/authority';
import client, {authStorageKey} from '@/services/client';
import {getPageQuery} from '@/utils/utils';
import {history} from '@@/core/history';
import jwt from 'jsonwebtoken';
import {message} from 'antd';
import {stringify} from 'querystring';

export interface User {
  id?: number;
  email?: string;
  enabled?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface AuthenticationState {
  accessToken?: string;
  authentication?: object;
  user?: User;
  currentAuthority?: 'user' | 'guest' | 'admin';
  errorMessage?: string;
}

export interface AuthenticationModalType {
  namespace: string;
  state: AuthenticationState;
  effects: {
    authentication: Effect;
    reAuthentication: Effect;
    logout: Effect;
  };
  reducers: {
    saveAuthentication: Reducer<AuthenticationState>;
    clearAuthentication: Reducer<AuthenticationState>;
  };
}

const AuthenticationModal: AuthenticationModalType = {
  namespace: 'authentication',
  state: {
    currentAuthority: 'guest',
  },
  effects: {
    * authentication({payload}, {put}) {
      try {
        // 认证
        const authResp = yield client.authenticate({...payload, strategy: 'local'});
        // yield enableSession();
        const {user} = authResp;
        if (user && user.id > 0) {
          // 认证成功
          authResp.currentAuthority = 'admin';
          yield put({type: 'saveAuthentication', payload: authResp});
          // 跳转到目标页面
          const urlParams = new URL(window.location.href);
          const params = getPageQuery();
          let {redirect} = params as { redirect: string };
          if (redirect) {
            const redirectUrlParams = new URL(redirect);
            if (redirectUrlParams.origin === urlParams.origin) {
              redirect = redirect.substr(urlParams.origin.length);
              if (redirect.match(/^\/.*#/)) {
                redirect = redirect.substr(redirect.indexOf('#') + 1);
              }
            } else {
              window.location.href = '/';
              return;
            }
          }
          history.replace(redirect || '/');
        } else {
          // 认证失败
          authResp.currentAuthority = 'guest';
          yield put({
            type: 'saveAuthentication',
            payload: {errorMessage: '用户名密码错误、用户不可用或者用户不存在。'},
          });
        }
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error(e);
        if (e.code === 401) {
          yield put({
            type: 'saveAuthentication',
            payload: {errorMessage: '用户名密码错误、用户不可用或者用户不存在。'},
          });
        } else {
          // 网络访问失败
          yield put({
            type: 'saveAuthentication',
            payload: {errorMessage: '登录失败，请联系管理员。'},
          });
        }
      }
    },
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    * reAuthentication({payload}, {put}) {
      try {
        // 认证
        const authResp = yield client.reAuthenticate();
        // yield enableSession();
        const {user} = authResp;
        if (user && user.id > 0) {
          // 认证成功
          authResp.currentAuthority = 'admin';
          yield put({
            type: 'saveAuthentication',
            payload: authResp,
          });
        } else {
          // 认证失败
          message.error('认证失败');
        }
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error(e);
        message.error('认证失败');
        // 网络访问失败
      }
    },
    logout() {
      const {redirect} = getPageQuery();
      localStorage.removeItem(authStorageKey);
      // Note: There may be security issues, please note
      if (window.location.pathname !== '/user/login' && !redirect) {
        history.replace({
          pathname: '/user/login',
          search: stringify({
            redirect: window.location.href,
          }),
        });
      }
    },
  },
  reducers: {
    saveAuthentication(state, {payload}) {
      setAuthority(payload.currentAuthority);
      return {
        ...state,
        ...payload,
      };
    },
    /**
     * 清空认证信息
     * @param state
     * @param payload
     */
    clearAuthentication(state) {
      setAuthority('guest');
      localStorage.removeItem(authStorageKey);
      return {
        ...state,
        accessToken: undefined,
        authentication: undefined,
        user: undefined,
        currentAuthority: 'guest',
        errorMessage: undefined,
      };
    },
  },
};

export default AuthenticationModal;

export interface TokenType {
  aud: string;
  exp: number;
  iat: number;
  iss: string;
  jti: string;
  sub: string;
}

export const getLocalToken = (): TokenType | undefined => {
  const accessToken = localStorage.getItem(authStorageKey);
  if (typeof accessToken === 'string') {
    return jwt.decode(accessToken) as TokenType;
  }
  return undefined;
};

export const isLocalTokenValid = (): boolean => {
  const localToken = getLocalToken();
  if (localToken) {
    const now = new Date().getTime();
    return localToken.exp * 1000 > now;
  }
  return false;
};
