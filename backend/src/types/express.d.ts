import type { IUser } from "../models/user.model.js";
import type { IWorkspace } from "../models/workspace.model.js";
declare global {
  namespace Express {
    interface Request {
      user?: IUser;
      workspace?: IWorkspace;
    }
  }
}
export {};
