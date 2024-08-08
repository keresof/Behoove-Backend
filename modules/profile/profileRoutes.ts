import { Router } from "express";
import { checkUsername, update } from "./profileController";
import {usernameRequired} from "../../middleware/usernameRequired";
import loginRequired from "../../middleware/loginRequired";

const router = Router();

router.post('/check-usernanme', loginRequired, checkUsername);
router.put('/', loginRequired, update);