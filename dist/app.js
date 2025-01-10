var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import express from 'express';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';
import bcrypt from 'bcryptjs';
import cors from 'cors';
import { auth } from "./middleware/auth";
dotenv.config();
import './db/conn';
import { User } from './models/UserModel';
const app = express();
const PORT = process.env.PORT || 500;
app.use(cookieParser());
app.use(cors({
    origin: [`${process.env.FRONT_END}`], // URL of the frontend
    credentials: true // To allow sending cookies over cross-origin requests
}));
app.use(express.json());
// genereate tokens
const generateToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.SECRET_TOKEN, {
        expiresIn: '30d',
    });
};
app.get("/", (req, res) => {
    res.send("Hello world");
});
app.post('/signup', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let { username, email, password } = req.body;
    try {
        const isExist = yield User.findOne({ email });
        if (isExist) {
            res.status(401).json({ message: "User already exist" });
        }
        else {
            password = yield bcrypt.hash(password, 10);
            const user = new User({ username, email, password });
            yield user.save();
            const token = generateToken(user._id);
            res.cookie('token', token, { httpOnly: true, sameSite: 'none', secure: true });
            res.status(201).json({ message: 'User created', userId: user._id });
        }
    }
    catch (error) {
        res.status(500).json({ message: "Please check the details" });
    }
}));
app.post('/login', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    try {
        const user = yield User.findOne({ email });
        if (user) {
            const comparePass = yield bcrypt.compare(password, user.password);
            if (comparePass) {
                const token = generateToken(user._id);
                res.cookie('token', token, { httpOnly: true, sameSite: 'none', secure: true });
                res.status(200).json({ message: 'User authenticated', userId: user._id });
            }
            else {
                res.status(401).json({ message: 'Invalid credentials' });
            }
        }
        else {
            res.status(401).json({ message: 'Invalid credentials' });
        }
    }
    catch (error) {
        res.status(500).json({ message: "Invalid Credentials" });
    }
}));
app.post('/addtodo', auth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { todoval } = req.body;
        const user = req.user;
        const id = req.userId;
        user.todo.unshift(({ todos: todoval }));
        yield user.save();
        res.status(201).json({ message: "Todo Added", id });
    }
    catch (error) {
        res.status(500).json({ message: error });
    }
}));
app.get("/getuser", auth, (req, res) => {
    try {
        res.status(200).send(req.user);
    }
    catch (error) {
        res.status(500).json({ message: error });
    }
});
app.post("/logout", (req, res) => {
    try {
        res.cookie('token', "", {
            httpOnly: true,
            sameSite: 'none',
            secure: true,
            expires: new Date(0)
        });
        res.status(200).send("Logged out successfully.");
    }
    catch (error) {
        res.status(500).send({ message: "Error while Logout" });
    }
});
app.delete("/delTodo/:id", auth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.user;
        const todo = user.todo;
        const todoId = req.params.id;
        // Filter out the todo item to delete
        user.todo = user.todo.filter((item) => item._id.toString() !== todoId);
        // Save the modified user back to the database
        yield user.save();
        res.status(200).json({ message: "deleted" });
    }
    catch (error) {
        res.status(500).json({ message: error });
    }
}));
app.listen(8000, () => {
    console.log(`Listenning on port number ${PORT}`);
});
