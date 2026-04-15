import jwt from 'jsonwebtoken';

export const signToken = (user) =>
  jwt.sign(
    { sub: user._id.toString(), role: user.role, email: user.email, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

export const verifyToken = (token) => jwt.verify(token, process.env.JWT_SECRET);

export const getAuthUser = (req) => {
  const header = req.headers.get('authorization') || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return null;
  try {
    return verifyToken(token);
  } catch {
    return null;
  }
};
