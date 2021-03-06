
import UserService from "../../src/Application/Services/impl/UserServiceImpl";
import { BadUserCreateDTO, GoodUserCreateDTO, GoodUserLoginDTO, BadUserLoginDTO, MockUserEntity, usersDB } from "../Mocks/User";
import UserServiceException, { PasswordException, TokenExpiredException } from "../../src/Application/Exceptions/UserServiceException";
import "ts-jest"

import token from "jsonwebtoken"
import { AuthDTO } from "../../src/Application/DTO/AuthDTO";
import dotenv from "dotenv"
import bcrypt from "bcryptjs"

import "reflect-metadata"
import container, { TYPES } from "../../src/ioc/container";
import MongooseUserRepository from "../../src/Data/Repository/implementations/MongooseUserRepository"
import UserDTO from "../../src/Application/DTO/UserDTO";
import { Criteria } from "../../src/Data/Helper/query";
dotenv.config()

describe('UserService tests', () => {

    let _userService: UserService;

    describe("create user service", () => {
        beforeEach(() => {
            jest.restoreAllMocks()

        })
        test("user with duplicate email and username", async () => {
            expect.assertions(1)
            MongooseUserRepository.prototype.save = jest.fn().mockResolvedValue(undefined)
            MongooseUserRepository.prototype.findOneOrNull = jest.fn().mockResolvedValue(MockUserEntity)
            _userService = container.get<UserService>(TYPES.UserService);

            try {
                await _userService.create(BadUserCreateDTO);
            } catch (error) {
                expect(error).toEqual(new UserServiceException(["This email already exists", "this username already exists"]))
            }

        })
        test("user with unique email and username", async () => {
            token.sign = jest.fn().mockImplementation((claims, key, options) => (key === process.env.JWT_KEY!) ? "token" : "refresh_token");
            MongooseUserRepository.prototype.save = jest.fn().mockResolvedValue(undefined)
            MongooseUserRepository.prototype.findOneOrNull = jest.fn().mockResolvedValue(null)
            _userService = container.get<UserService>(TYPES.UserService);
            const expectedAuthDTO: AuthDTO = { refreshToken: "refresh_token", token: "token" }


            await expect(_userService.create(GoodUserCreateDTO)).resolves.toEqual(expectedAuthDTO)
        })
    })
    describe("get all user service", () => {
        test("get all users", async () => {
            const expectedUsers = <Array<UserDTO>>[{
                username: "Pamela",
                email: "Pamela@gmail.com",
                location: "Chorrillos"
            },
            {
                username: "Alejandra",
                email: "Alejandra@gmail.com",
                location: "Chorrillos"
            },
            {
                username: "Elizabeth",
                email: "Elizabeth@gmail.com",
                location: "Chorrillos"
            }
            ]
            MongooseUserRepository.prototype.findAll = jest.fn().mockResolvedValue(usersDB.filter((v) => v.location === "Chorrillos"))

            const users = await _userService.getAll({
                location:"Chorrillos"
            });

            expect(users).toEqual(expectedUsers)

        })

        test("valid query builder", async () => {
            MongooseUserRepository.prototype.findAll = jest.fn().mockResolvedValue(usersDB)
            const expectedQuery: Criteria = {
                where: [{property:"location",eq:"Chorrillos"}],
            }

            await _userService.getAll({
                location:"Chorrillos"
            });

            expect(MongooseUserRepository.prototype.findAll).toHaveBeenCalledWith(expectedQuery)

        })



    })

    describe("login user service", () => {
        afterEach(() => {
            jest.resetAllMocks()
        })
        test("login valid user", async () => {
            token.sign = jest.fn().mockImplementation((claims, key, options) => (key === process.env.JWT_KEY!) ? "token" : "refresh_token");
            const expectedAuthDTO: AuthDTO = { refreshToken: "refresh_token", token: "token" }
            bcrypt.compare = jest.fn().mockResolvedValueOnce(true);
            MongooseUserRepository.prototype.findOne = jest.fn().mockResolvedValue(MockUserEntity)
            MongooseUserRepository.prototype.update = jest.fn().mockResolvedValue(undefined)
            _userService = container.get<UserService>(TYPES.UserService);

            const login = await _userService.login(GoodUserLoginDTO)
            expect(login).toEqual(expectedAuthDTO)
        })
        test("login invalid password", async () => {
            bcrypt.compare = jest.fn().mockResolvedValueOnce(false);
            MongooseUserRepository.prototype.findOne = jest.fn().mockResolvedValue(MockUserEntity)
            MongooseUserRepository.prototype.update = jest.fn().mockResolvedValue(undefined)
            _userService = container.get<UserService>(TYPES.UserService);
            expect.assertions(1)
            try {
                await _userService.login(BadUserLoginDTO);
            } catch (error) {
                expect(error).toBeInstanceOf(PasswordException)
            }
        })
        describe("Generate Token",()=>{
            afterEach(() => {
                jest.resetAllMocks()
            })
            test("Valid Refresh Token",async()=>{
                token.decode = jest.fn().mockReturnValue({id:"id"})
                token.verify = jest.fn().mockReturnValue(undefined)
                token.sign = jest.fn().mockReturnValue("new token");
                MockUserEntity.refreshToken = "refresh token"
                MongooseUserRepository.prototype.findOne = jest.fn().mockResolvedValue
                (MockUserEntity)
                _userService = container.get<UserService>(TYPES.UserService);
                const expected:AuthDTO = {refreshToken :"refresh token", token:"new token"}
                const auth = await _userService.generateToken("old token")
                expect(auth).toEqual(expected)

            })

            test("Invalid Refresh Token",async()=>{
                expect.assertions(1)
                token.decode = jest.fn().mockReturnValue({id:"id"})
                token.verify = jest.fn().mockImplementationOnce(()=>{
                    throw new TokenExpiredException()
                })
                MockUserEntity.refreshToken = "refresh token"
                MongooseUserRepository.prototype.findOne = jest.fn().mockResolvedValue
                (MockUserEntity)
                _userService = container.get<UserService>(TYPES.UserService);
                try {
                   await _userService.generateToken("old token")
                } catch (error) {
                    expect(error).toBeInstanceOf(TokenExpiredException)
                }
            })
        })

    })

})
