// Express Request Type Augmentation
// Extends Express's built-in Request interface to carry the
// authenticated user — set by the protect middleware.
// The .d.ts extension means this is a declaration file —
// TypeScript merges it with Express's existing types automatically.

import { IUserDocument } from "../models/user.model";

declare global {
    namespace Express {
        interface Request {
            user?: IUserDocument;
        }
    }
}

export {}