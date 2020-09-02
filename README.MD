# Bootcamp

This is my own scaffolding for building JavaScript fullstack enterprise webapp.

It is made of a nodejs backend in server folder and a react web client in console folder.

I have done the basic setups, and I believe you can run this project straight forward after you configured database connection in `/server/config/default.json`'.

To get your hands on this project, you should have basic knowledge of NodeJS, React and TypeScript.

## A FeathersJS Server

The backend server of this webapp is built upon [FeathersJS](https://feathersjs.com/), a framework for real-time applications and REST APIs.

Please read FeathersJS' guide and doc before you get hands on this project.

## A Umijs Console

The web client of this webapp is built upon [UmiJS](https://umijs.org/), a pluggable enterprise-level react application framework.

Please read UmiJS' guide and doc before you get hands on this project.

## Database Configration

Assuming you have read FeathersJS' guide and doc. Before you run this webapp, please setup your database configuration in `/server/config/default.json`, it uses MySQL by default.

## Users and Authentication

Users and authentication are both initiated at web client side and server site. Please setup your initial username(email) and password in `/server/config/default.json`. User will be generated at first run.

This project uses [JSONWebToken, aka jwt,](https://jwt.io/) for authentication strategey.

## Run

### Server

Run in server folder

```bash
npm install;  # Install dependencies.
npm start;    # Run the server.
npm run dev;  # Optional, run the server in dev mode in which the app reloads on code change.
```

### Console

Run in console folder

```bash
- npm install; # Install dependencies.
- npm start;   # Start developing the console, the server namespace will be assigned to localhost:3030.
```

## Deploy Console

Run in console folder

```bash
- npm run build; # Build console for production into dist folder.
- cp -r dist ../server/public/console # Place console dist to server's public folder for static serving.
```
