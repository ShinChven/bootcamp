import type {ErrorResponse} from "@/services/client";
import client from "@/services/client";


export interface Authentication {
  strategy: string;
}

export type IAuthenticationResponse = {
  accessToken?: string;
  authentication?: Authentication;
  user?: User;
}


export type User = {
  id?: number;
  email?: string;
  enabled?: number;
  access?: 'user' | 'guest' | 'admin';
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export type IAuthenticateParams = {
  email: string;
  password: string;
  strategy?: string
}

export const authenticate = async (params: IAuthenticateParams):
  Promise<IAuthenticationResponse | ErrorResponse> =>
  await client.authenticate({...params, strategy: 'local'});

export const reAuthenticate = async () => client.reAuthenticate();

export const logout = async () => client.logout()
