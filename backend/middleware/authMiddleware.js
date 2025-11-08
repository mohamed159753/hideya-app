const User = require('../models/User');

// Simple auth middleware helpers. This is intentionally minimal and assumes the
// calling environment will replace or extend with real token verification.
// It supports two helpers: required (enforces presence) and optional (sets req.user if provided).

// Extract a user id from Authorization header in form "Bearer <userId>"
function extractUserIdFromHeader(req) {
	const h = req.headers?.authorization || req.headers?.Authorization;
	if (!h) return null;
	const parts = String(h).split(' ');
	if (parts.length === 2 && parts[0] === 'Bearer') return parts[1];
	return null;
}

exports.required = async function (req, res, next) {
	try {
		const uid = extractUserIdFromHeader(req) || req.body?.requestedBy || req.query?.requestedBy;
		if (!uid) return res.status(401).json({ message: 'Authentication required' });
		// Lightweight attach user object if exists in DB
		try {
			const user = await User.findById(uid).select('firstName lastName email');
			if (user) req.user = { id: String(user._id), firstName: user.firstName, lastName: user.lastName };
			else req.user = { id: uid };
		} catch (e) {
			req.user = { id: uid };
		}
		return next();
	} catch (err) {
		console.error('auth.required error', err);
		return res.status(500).json({ message: 'Auth error' });
	}
};

exports.optional = async function (req, res, next) {
	try {
		const uid = extractUserIdFromHeader(req) || req.body?.requestedBy || req.query?.requestedBy;
		if (uid) {
			try {
				const user = await User.findById(uid).select('firstName lastName email');
				if (user) req.user = { id: String(user._id), firstName: user.firstName, lastName: user.lastName };
				else req.user = { id: uid };
			} catch (e) {
				req.user = { id: uid };
			}
		}
		return next();
	} catch (err) {
		console.error('auth.optional error', err);
		return res.status(500).json({ message: 'Auth error' });
	}
};
