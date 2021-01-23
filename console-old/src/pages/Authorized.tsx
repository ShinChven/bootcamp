import React from 'react';
import {connect, ConnectProps, Redirect} from 'umi';
import Authorized from '@/utils/Authorized';
import {getRouteAuthority} from '@/utils/utils';
import {ConnectState,} from '@/models/connect';
import {AuthenticationState} from "@/models/authentication";

interface AuthComponentProps extends ConnectProps {
  authentication: AuthenticationState;
}

const AuthComponent: React.FC<AuthComponentProps> = ({
                                                       children,
                                                       route = {
                                                         routes: [],
                                                       },
                                                       location = {
                                                         pathname: '',
                                                       },
                                                       authentication,
                                                     }) => {
  const {user} = authentication;
  const {routes = []} = route;
  const isLogin = user && user.name;
  return (
    <Authorized
      authority={getRouteAuthority(location.pathname, routes) || ''}
      noMatch={isLogin ? <Redirect to="/exception/403"/> : <Redirect to="/user/login"/>}
    >
      {children}
    </Authorized>
  );
};

export default connect(({authentication}: ConnectState) => ({
  authentication,
}))(AuthComponent);
