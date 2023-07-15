/**
 * This will check the current saved Token (if exists) if its valid
 * @returns {Promise}
 */
function checkTokenValidity(){
  return new Promise(function(resolve, reject) {
    const getUrl = window.location;
    const baseUrl = getUrl.protocol + "//" + getUrl.host + "/";
    if (localStorage.getItem("token") !== null) {
      //Token was found, now validate it and if valid forward to /public
      const posting = $.ajax({
        url: `${baseUrl}api/v1/login/check`,
        type: "POST",
        contentType: "application/json; charset=utf-8",
        headers: { Authorization: "Bearer " + localStorage.getItem("token") }
      });
      posting.done(function(result) {
        resolve(result)
      })
      posting.fail(function(err) {
        if(err.status === 400 || err.status === 401){
          window.location.replace(`${baseUrl}login`);
        }
      });
    }else{
      window.location.replace(`${baseUrl}login`);
    }
  });
}

/**
 * @typedef {Object} PermissionResponse
 * @property {Boolean} result - True if the user has the permission
 * @property {String} reason - The reason for the result
 */

/**
 * [Route].[Endpoint].[Exact(Optional)]
 * It can use * to terminate early AND make all permissions below it true.
 * @param {String} user_permissions 
 * @param {String} required_permission 
 * @returns {PermissionResponse}
 */
const checkPermission = (user_permissions, required_permission) => {
  if (!user_permissions) {
    return { result: false, reason: "Permission not found." };
  }

  for (let i = 0; i < user_permissions.length; i++) {
    let perm = user_permissions[i];
    if (perm === required_permission || perm === "*" || (perm.endsWith(".*") && required_permission.startsWith(perm.slice(0, -2)))) {
      return { result: true, reason: perm };
    }
  }

  return { result: false, reason: "Not permitted." };
}

/**
 * This will check the current saved Token (if exists) if its valid
 * @returns {Promise}
 */
function logout(){
  return new Promise(function(resolve, reject) {
    const getUrl = window.location;
    const baseUrl = getUrl.protocol + "//" + getUrl.host + "/";
    if (localStorage.getItem("token") !== null) {
      //Token was found, now validate it and if valid forward to /public
      const posting = $.ajax({
        url: `${baseUrl}api/v1/login/logout`,
        type: "POST",
        contentType: "application/json; charset=utf-8",
        headers: { Authorization: "Bearer " + localStorage.getItem("token") }
      });
      posting.done(function(result) {
        localStorage.removeItem("token");
        localStorage.removeItem("username");
        localStorage.removeItem("language");
        localStorage.removeItem("permssions");
        window.location.replace(`${baseUrl}login`);
        resolve(result)
      })
      posting.fail(function(err) {
        if(err.status === 400 || err.status === 401){
          
        }
      });
    }
  });
}