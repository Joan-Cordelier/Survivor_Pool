import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../global';

declare module 'express-serve-static-core' {
    interface Request {
        user?: any;
    }
}

console.log(JWT_SECRET);

if (!JWT_SECRET)
    console.warn('Warning: JWT_SECRET is not set. Using fallback secret (not safe for production).');

export function signToken(payload: object): string { // quand on login
    return jwt.sign(payload, JWT_SECRET, {expiresIn: '1h'});
}

export function verifyToken(token: string) {
    return jwt.verify(token, JWT_SECRET);
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
    try {
        const auth = (req.headers.authorization as string) || '';
        const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
    
        if (!token)
            return res.status(401).json({message: 'Authentication required'});
        const decoded = verifyToken(token) as any;
        req.user = decoded;
        return next();
    } catch (err: any) {
        return res.status(401).json({ message: 'Invalid or expired token', details: err?.message });
    }
}

export function optionalAuth(req: Request, res: Response, next: NextFunction) {
    try {
        const auth = (req.headers.authorization as string) || '';
        const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
        
        if (!token)
            return next();
        const decoded = verifyToken(token) as any;
        req.user = decoded;
        return next();
    } catch (err) {
        return next();
    }
}

export function authorizeRoles(...allowedRoles: string[]) {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!req.user)
            return res.status(401).json({ message: 'Authentication required' });

        const role = (req.user as any).role;

        if (!role || !allowedRoles.includes(role))
            return res.status(403).json({ message: 'Forbidden' });
        return next();
    };
}

export function extractBearerToken(req: Request): string | null {
    const auth = (req.headers.authorization as string) || '';
    return auth.startsWith('Bearer ') ? auth.slice(7) : null;
}

export default {
    signToken,
    verifyToken,
    requireAuth,
    optionalAuth,
    authorizeRoles,
    extractBearerToken,
};
