import {Application} from "../declarations";
import bcrypt from 'bcrypt';
import generator from 'generate-password';

async function hashPassword(password: string): Promise<string> {
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
      let password = generator.generate({
        length: 10,
        numbers: true
      });
      const userRawData = {email: user.email, password: user.password || password};
      user.password = await hashPassword(userRawData.password);
      const initialized = await users.create(user);
      console.log(`initialized user: ${JSON.stringify(userRawData)}`);
    }
  } catch (e) {
    console.error(e);
  }
}
