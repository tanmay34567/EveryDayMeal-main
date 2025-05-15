import express from 'express';

import {
  register,
  login,
  isAuth,
  logout,
  saveMenu,
  getMenu,
  deleteMenu,
  getMenuByEmail,
} from '../controllers/Vendorcontroller.js';

import authVendor from '../middlewares/authVendor.js';

const VendorRouter = express.Router();

// Public routes
VendorRouter.post('/register', register);
VendorRouter.post('/login', login);
VendorRouter.get('/menu/:email', getMenuByEmail); // Public route for students to view menus

// Protected routes (requires vendor authentication)
VendorRouter.get('/is-auth', authVendor, isAuth);
VendorRouter.get('/logout', authVendor, logout);

VendorRouter.post('/menu', authVendor, saveMenu);       // Create or update menu
VendorRouter.get('/menu', authVendor, getMenu);         // Get logged-in vendor's menu
VendorRouter.delete('/menu', authVendor, deleteMenu);   // Delete logged-in vendor's menu

export default VendorRouter;
