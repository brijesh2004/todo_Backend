var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import jwt from "jsonwebtoken";
import { User } from "../models/UserModel";
const auth = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const token = req.cookies.token;
        if (!token) {
            return res.status(401).json({ message: "No token found" });
        }
        // Decode token to find userId
        const decoded = jwt.verify(token, process.env.SECRET_TOKEN); // Directly use the secret key
        if (typeof decoded !== 'object' || !decoded.id) {
            return res.status(401).json({ message: "Invalid token" });
        }
        const userId = decoded.id;
        const user = yield User.findOne({ _id: userId });
        if (!user) {
            throw new Error("User Not found");
        }
        req.token = token;
        req.user = user;
        req.userId = user._id;
        next();
    }
    catch (err) {
        res.status(401).send("Unauthorized : No token Provided");
    }
});
export { auth };
