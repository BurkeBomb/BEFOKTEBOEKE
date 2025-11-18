import type { VercelRequest, VercelResponse } from "@vercel/node";
import app from "../server/index";

// Express apps are (req, res) handlers – forward directly
export default (req: VercelRequest, res: VercelResponse) => {
+return (app as unkonwn)(req, res);
};
