function hasPermission(user, permissionsNeeded) {
  const matchedPermissions = user.permissions.filter(permissionTheyHave =>
    permissionsNeeded.includes(permissionTheyHave)
  );
  if (!matchedPermissions.length) {
    throw new Error(`You do not have sufficient permissions

      : ${permissionsNeeded}

      You Have:

      ${user.permissions}
      `);
  }
}

function checkIsLoggedIn(ctx) {
  const { userId } = ctx.response;
  if (!userId) {
    throw new Error("You must be logged in!");
  }
  return userId;
}

exports.checkIsLoggedIn = checkIsLoggedIn;
exports.hasPermission = hasPermission;
