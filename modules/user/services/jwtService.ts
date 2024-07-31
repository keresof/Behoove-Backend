import jwt, { Secret } from "jsonwebtoken";
import { ACCESS_TOKEN_EXPIRATION } from "../../../utilities/constants";

const { AUTH_JWT_SECRET } = process.env;

/**
 * Creates a signed jwt with the given payload
 * @param payload payload of the token
 * @returns signed token
 */
export function createJwt(payload: any) {
    if(!(payload instanceof Object)) {
        throw new Error("Payload must be an object");
    }
    return jwt.sign(
        // data payload
        payload,
        (AUTH_JWT_SECRET as Secret),
        { expiresIn: ACCESS_TOKEN_EXPIRATION }
    );
}

/**
 * Verifies a jwt token
 * @param token token to verify
 * @param verifyOptions options for verification
 * @returns decoded token
 * @throws error if token is invalid
 * @throws error if token is expired, if options are set
 * @throws error if token is invalid, if options are set
 * @throws error if token is not before the start time, if options are set
 */
export function verifyJwt(token: string, verifyOptions?: jwt.VerifyOptions) {
    return jwt.verify(token, (AUTH_JWT_SECRET as Secret), verifyOptions);
}