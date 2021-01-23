import {Sequelize} from 'sequelize';
import {Application} from './declarations';
import init from './init';
import {parentPath, realPath} from "./path-tool";
import fs from 'fs-extra';

export default function (app: Application) {
  let sequelize: Sequelize | undefined;

  const databaseType = app.get('database');

  if (databaseType === 'mysql') {
    const connectionString = app.get('mysql');
    sequelize = new Sequelize(connectionString, {
      dialect: 'mysql',
      logging: process.env.NODE_ENV === 'production' ? false : console.log,
      define: {
        freezeTableName: true
      }
    });
  } else if (databaseType === 'sqlite') {
    const databasePath = realPath(app.get('sqlite'));
    console.log(databasePath)
    fs.ensureDirSync(parentPath(databasePath)!);
    sequelize = new Sequelize({
      dialect: 'sqlite',
      storage: databasePath,
      logging: false,
      define: {
        freezeTableName: true
      }
    });
  }

  const oldSetup = app.setup;

  app.set('sequelizeClient', sequelize!);
  app.setup = function (...args) {
    const result = oldSetup.apply(this, args);

    // Set up data relationships
    const models = sequelize?.models || {};
    Object.keys(models).forEach(name => {
      if ('associate' in models[name]) {
        (models[name] as any).associate(models);
      }
    });

    // Sync to the database
    app.set('sequelizeSync', sequelize?.sync().then(() => {
      app.configure(init);
    }));

    return result;
  };
}

