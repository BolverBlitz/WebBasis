const db = require('pg');
const { SQLError } = require('@lib/errors');

const pool = new db.Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
})

pool.query(`CREATE TABLE IF NOT EXISTS users (
    username text PRIMARY KEY,
    password text,
    twofa_secret text,
    twofa_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    twofa_token text,
    language text,
    time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP)`, (err, result) => {
  if (err) { process.log.error(`Table-gen: Error users: ${err}`) }
});

pool.query(`CREATE TABLE IF NOT EXISTS users_permissions (
    username text,
    permission text,
    read boolean,
    write boolean,
    time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (username, permission))`, (err, result) => {
  if (err) { process.log.error(`Table-gen: Error users_permissions ${err}`) }
});

pool.query(`CREATE TABLE IF NOT EXISTS webtokens (
  username text,
  token text,
  ip text,
  browser text,
  language text,
  time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (token))`, (err, result) => {
  if (err) { process.log.error(`Table-gen: Error webtokens ${err}`) }
});

/* --- --- --- --- --- Querys --- --- --- --- --- */

/* --- --- --- Users --- --- --- */

/**
 * Insert a new User
 * @param {String} user 
 * @param {String} password 
 * @param {String} language 
 * @param {String} twofa_secret 
 * @returns 
 */
const UsersCreate = (user, password, language, twofa_secret = null) => {
  return new Promise((resolve, reject) => {
    pool.query(`INSERT INTO users (username, password, language, twofa_secret) VALUES ($1, $2, $3, $4)`, [user, password, language, twofa_secret], (err, result) => {
      if (err) { reject(new SQLError(err)) }
      resolve(result)
    })
  })
}

/**
 * Get User Data
 * @param {String} user 
 * @returns {Promise<Array>}
 */
const UsersGet = (user) => {
  return new Promise((resolve, reject) => {
    pool.query(`SELECT * FROM users WHERE username = $1`, [user], (err, result) => {
      if (err) { reject(new SQLError(err)) }
      resolve(result.rows)
    })
  })
}

/**
 * twofa_time is used to check if the user had a recent login
 * @param {String} user 
 * @param {String} twofa_token
 * @param {Number} time 
 * @returns 
 */
const Updatetwofa_time = (user, twofa_token, time = null) => {
  return new Promise((resolve, reject) => {
    pool.query(`UPDATE users SET twofa_time = $1, twofa_token = $2 WHERE username = $3`, [time, twofa_token, user], (err, result) => {
      if (err) { reject(new SQLError(err)) }
      resolve(result)
    })
  })
}

/* --- --- --- User Permissions --- --- --- */

/**
 * Insert or Update User Permissions
 * @param {String} user 
 * @param {String} permission 
 * @param {Boolean} read 
 * @param {Boolean} write 
 * @returns 
 */
const AddPermissionToUser = (user, permission, read, write) => {
  return new Promise((resolve, reject) => {
    pool.query(`INSERT INTO users_permissions (username, permission, read, write) VALUES ($1, $2, $3, $4) ON CONFLICT (username, permission) DO UPDATE SET read = $3, write = $4`, [user, permission, read, write], (err, result) => {
      if (err) { reject(new SQLError(err)) }
      resolve(result)
    })
  })
}

/**
 * This function is used to get a list of permissions of a user
 * @param {String} username
 * @returns {Promise}
 */
const GetPermissionFromUser = function (username) {
  return new Promise(function (resolve, reject) {
    pool.query(`SELECT permission, read, write FROM users_permissions WHERE username = $1`, [
      username
    ], (err, result) => {
      if (err) { reject(new SQLError(err)) }
      resolve(result);
    });
  });
}

/**
 * This function is used to remove a permission from a user
 * @param {String} username
 * @param {String} permission
 * @returns {Promise}
 */
const DelPermissionFromUser = function (username, permission) {
  return new Promise(function (resolve, reject) {
    pool.query(`DELETE FROM users_permissions WHERE username = $1 AND permission = $2`, [
      username, permission
    ], (err, result) => {
      if (err) { reject(new SQLError(err)) }
      resolve(result);
    });
  });
}

/**
 * This function is used to update r/w of a permission of a user
 * @param {String} username
 * @param {String} permission
 * @param {boolean} read
 * @param {boolean} write
 * @returns {Promise}
 */
const UpdatePermissionFromUser = function (username, permission, read, write) {
  return new Promise(function (resolve, reject) {
    pool.query(`UPDATE users_permissions SET read = $3, write = $4 WHERE username = $1 AND permission = $2`, [
      username, permission, read, write
    ], (err, result) => {
      if (err) { reject(new SQLError(err)) }
      resolve(result);
    });
  });
}

/* --- --- --- Webtokens --- --- --- */

/**
 * Insert a new Webtoken
 * @param {String} user 
 * @param {String} token 
 * @param {String} ip 
 * @param {String} browser 
 * @param {String} language
 * @returns 
 */
const WebtokensCreate = (user, token, ip, browser, language) => {
  return new Promise((resolve, reject) => {
    pool.query(`INSERT INTO webtokens (username, token, ip, browser, language) VALUES ($1, $2, $3, $4, $5)`, [user, token, ip, browser, language], (err, result) => {
      if (err) { reject(new SQLError(err)) }
      resolve(result)
    })
  })
}

/**
 * Get data from a Webtoken
 * @param {String} token 
 * @returns 
 */
const WebtokensGet = (token) => {
  return new Promise((resolve, reject) => {
    pool.query(`SELECT * FROM webtokens WHERE token = $1`, [token], (err, result) => {
      if (err) { reject(new SQLError(err)) }
      resolve(result.rows)
    })
  })
}

/**
 * Remove a Webtoken from the database
 * @param {String} token 
 * @returns 
 */
const WebtokensDelete = (token) => {
  return new Promise((resolve, reject) => {
    pool.query(`DELETE FROM webtokens WHERE token = $1`, [token], (err, result) => {
      if (err) { reject(new SQLError(err)) }
      resolve(result)
    })
  })
}

/* --- --- --- Exports --- --- --- */

const user = {
  create: UsersCreate,
  get: UsersGet,
  update: {
    twofa_time: Updatetwofa_time
  },
  permission: {
    add: AddPermissionToUser,
    get: GetPermissionFromUser,
    del: DelPermissionFromUser,
    update: UpdatePermissionFromUser
  }
}

const webtoken = {
  create: WebtokensCreate,
  get: WebtokensGet,
  delete: WebtokensDelete
}


module.exports = {
  user,
  webtoken
}