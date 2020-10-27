var sqlite3 = require('sqlite3');
var db = new sqlite3.Database('./data/database.db');

var bcrypt = require('bcrypt');
var saltRounds = 10;

var users = {}



users.Editing_profiles = (Editing, user, callback) => {
  var success = true;
  var error_message = "";
  if (!success) {
    var result = {
      success: false,
      error_message: error_message
    };
    return callback(result);
  }
var sql = `
UPDATE Users
SET firstName = ?,
lastName = ?,
birthdate= ?,
bio = ?,
gender = ?
WHERE id = ?
`
var params =[Editing.firstName,Editing.lastName,Editing.birthdate,Editing.bio,Editing.gender,user.id];
db.run(sql, params, function (err, result) {
  callback();
});
}
















/**
 * Authenticates a user.
 *
 * The callback takes a single parameter:
 * {
 *   success: boolean,
 *   error_message: string,
 *   user: user { id, username }
 * }
 * error_message will always be defined when success is false.
 * user will always be defined when success is true.
 */
users.login = (credentials, callback) => {
  db.get("SELECT * FROM Users WHERE username = ?", [credentials.username], (err, user_row) => {
    if (err) {
      var result = {
        success: false,
        error_message: err
      };
      return callback(result);
    }
    if (!user_row) {
      var result = {
        success: false,
        error_message: "We don't recognize your username. Did you want to sign up?"
      };
      return callback(result);
    }
    bcrypt.compare(credentials.password, user_row.passwordHash, (err, passwords_match) => {
      if (!passwords_match) {
        var result = {
          success: false,
          error_message: "Login failed."
        };
        return callback(result);
      }
      var result = {
        success: true,
        user: {
          id: user_row.id,
          username: user_row.username
        }
      };
      return callback(result);
    });
  });
};

/**
 * Creates a new user.
 *
 * The callback takes a single parameter:
 * {
 *   success: boolean,
 *   error_message: string,
 *   user: user { id, username }
 * }
 * error_message will always be defined when success is false.
 * user will always be defined when success is true.
 */
users.signup = (credentials, callback) => {
  if (credentials.password.length < 3) {
    var result = {
      success: false,
      error_message: "Your password is not long enough (3 character minimum)!"
    };
    return callback(result);
  }

  bcrypt.hash(credentials.password, saltRounds, (err, passwordHash) => {
    var sql ='INSERT INTO users (username, passwordHash) VALUES (?, ?)';
    var params =[credentials.username, passwordHash];
    db.run(sql, params, function (err, result){
      var success = false;
      var error_message = "";
      var user = { username: credentials.username }

      if (err) {
        // Really?
        error_message = "Username taken! Please try another!";
      } else {
        success = true;
        user.id = this.lastID
      }

      var result = {
        success: success,
        error_message: error_message,
        user: user
      };
      return callback(result);
    });
  });
};

/**
 * Retrieves a user by id.
 *
 * The callback takes a single parameter, the user - which is non-null if the
 * request was successful and a user was found.
 *
 * {
 *   id: integer,
 *   username: string,
 * }
 */
users.get = (id, callback) => {
  db.get("SELECT * FROM Users WHERE id = ?", [id], (err, row) => {
    if (err) {
      callback(null);
      return;
    }
    var user = {
      id: row.id,
      username: row.username
    };
    callback(user);
  });
};

module.exports = users;
