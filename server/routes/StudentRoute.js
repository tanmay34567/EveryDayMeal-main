import express from 'express';
import authStudent from '../middlewares/authStudent.js';

import {
  registerStudent,
  loginStudent,
  logoutStudent,
  isAuthStudent
} from '../controllers/Studentcontroller.js';

import { getVendorsWithMenus } from '../controllers/Vendorcontroller.js';

const StudentRouter = express.Router();

StudentRouter.post('/register', registerStudent);
StudentRouter.post('/login', loginStudent);
StudentRouter.get('/is-auth', authStudent, isAuthStudent);
StudentRouter.get('/logout', authStudent, logoutStudent);
StudentRouter.get('/vendors-with-menus', getVendorsWithMenus);

export default StudentRouter;
