import { MenuDataItem, Settings as ProSettings } from '@ant-design/pro-layout';
import { AuthenticationState } from '@/models/authentication';
import { GlobalModelState } from './global';

export { GlobalModelState };

export interface Loading {
  global: boolean;
  effects: { [key: string]: boolean | undefined };
  models: {
    global?: boolean;
    menu?: boolean;
    setting?: boolean;
    user?: boolean;
  };
}

export interface ConnectState {
  global: GlobalModelState;
  loading: Loading;
  settings: ProSettings;
  authentication: AuthenticationState;
}

export interface Route extends MenuDataItem {
  routes?: Route[];
}
