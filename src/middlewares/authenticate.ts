import { expressjwt, GetVerificationKey } from "express-jwt";
import { Request } from "express";
import JwksClient from "jwks-rsa";
import { Config } from "../config";

export default expressjwt({
  secret: JwksClient.expressJwtSecret({
    jwksUri: Config.JWKS_URI!,
    cache: true,
    rateLimit: true,
  }) as unknown as GetVerificationKey,

  algorithms: ["RS256"],

  getToken(req: Request) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.split(" ")[1] !== "undefined") {
      const token = authHeader.split(" ")[1];
      if (token) {
        return token;
      }
    }
    const { accessToken } = req.cookies;
    console.log("Token=>",accessToken);
    if (!accessToken) return null;
    return accessToken;
  },
});
