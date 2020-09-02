import { Application } from '../declarations';
import user from './user';
// Don't remove this comment. It's needed to format import lines nicely.

export default function (app: Application) {
  app.configure(user);
}
