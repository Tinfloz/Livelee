import { IUser } from "../../src/models/all.user.model";

declare global {
    namespace Express {
        interface Request {
            user?: IUser | null
        }
    }
}