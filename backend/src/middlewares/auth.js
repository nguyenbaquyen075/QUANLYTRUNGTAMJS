// Authentication Middleware

// Middleware to populate local variables for EJS rendering from session
function populateLocals(req, res, next) {
  res.locals.isLoggedIn = !!req.session.userId;
  res.locals.currentUserId = req.session.userId || null;
  res.locals.currentUserRole = req.session.userRole || null;
  res.locals.currentUserFullName = req.session.userFullName || null;
  res.locals.currentUserEmail = req.session.userEmail || null;
  res.locals.currentUserPhone = req.session.userPhone || null;
  res.locals.currentUserAvatarUrl = req.session.userAvatarUrl || null;

  // Flash messages
  res.locals.successMessage = req.session.successMessage || null;
  res.locals.errorMessage = req.session.errorMessage || null;

  // Clear flash messages after loading them once
  delete req.session.successMessage;
  delete req.session.errorMessage;

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
