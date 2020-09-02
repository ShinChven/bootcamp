import {Application} from "../declarations";
import bcrypt from 'bcrypt';
import {UserType} from "../models/users.model";

async function hashPassword(user: UserType) {

  const password = user.password
  const saltRounds = 10;
  return await new Promise((resolve, reject) => {
    bcrypt.hash(password, saltRounds, function (err, hash) {
      if (err) reject(err)
      resolve(hash)
    });
  })
}

export default async function (app: Application) {
  try {
    const {settings} = app;
    const {sequelizeClient} = settings;
    const {models} = sequelizeClient;
    const {users} = models;
    const found = await users.findAll();
    if (found.length === 0) {
      const init = app.get('init');
      const {user} = init;
      console.log(`initializing user: ${JSON.stringify(user)}`);
      user.password = await hashPassword(user);
      const initialized = await users.create(user);
      console.log(`initialized user: ${JSON.stringify(initialized)}`);
    }
  } catch (e) {
    console.error(e);
  }
}
