// Authentication Middleware

// Middleware to populate local variables for EJS rendering from session
function populateLocals(req, res, next) {
  const sess = req.session || {};
  res.locals.isLoggedIn = !!sess.userId;
  res.locals.currentUserId = sess.userId || null;
  res.locals.currentUserRole = sess.userRole || null;
  res.locals.currentUserFullName = sess.userFullName || null;
  res.locals.currentUserEmail = sess.userEmail || null;
  res.locals.currentUserPhone = sess.userPhone || null;
  res.locals.currentUserAvatarUrl = sess.userAvatarUrl || null;

  // Flash messages
  res.locals.successMessage = sess.successMessage || null;
  res.locals.errorMessage = sess.errorMessage || null;

  if (req.session) {
    delete req.session.successMessage;
    delete req.session.errorMessage;
  }

  next();
}

// Middleware to restrict access based on login status and roles
function requireAuth(allowedRoles = []) {
  return (req, res, next) => {
    if (!req.session.userId) {
      const returnUrl = req.originalUrl;
      req.session.errorMessage = "Vui lòng đăng nhập để tiếp tục.";
      return res.redirect(`/Auth/Login?returnUrl=${encodeURIComponent(returnUrl)}`);
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(req.session.userRole)) {
      return res.redirect('/Auth/AccessDenied');
    }

    next();
  };
}

module.exports = {
  populateLocals,
  requireAuth
};
