import mongoose from "mongoose";
import User from "./user";

declare global {
    var __MONGO_URI__: string;
}

beforeAll(async () => {
    await mongoose.connect(global.__MONGO_URI__);
    await User.deleteMany({});
});

afterAll(async () => {
    await mongoose.connection.close();
});

describe("User Model", () => {
    it("should correctly hash a password", async () => {
        const password = "123456aA!";
        const user = await User.create({
            email: "test@test.com",
            password: password,
        });
        expect(user.password).not.toEqual(password);
        expect(await user.verifyPassword(password)).toBe(true);
    });

    it("should not return password hash in JSON", async () => {
        const user = await User.findOne({ email: "test@test.com" });
        expect(user).not.toBeNull();
        const userJson = user?.toJSON();
        expect(userJson?.password).toBeFalsy();
    });


});