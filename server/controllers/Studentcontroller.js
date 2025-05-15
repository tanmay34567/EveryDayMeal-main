// controllers/studentController.js
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Student from '../models/Student.js';

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

export const registerStudent = async (req, res) => {
  try {
    const { name, email, password, contactNumber } = req.body;

    if (!name || !email || !password || !contactNumber) {
      return res.status(400).json({ success: false, message: 'Missing required details' });
    }

    const existingStudent = await Student.findOne({ email });
    if (existingStudent) {
      return res.status(409).json({ success: false, message: 'Student already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newStudent = await Student.create({ name, email, password: hashedPassword, contactNumber });

    const token = generateToken(newStudent._id);
    res.cookie('Studentlogintoken', token, req.app.locals.cookieConfig);

    return res.status(201).json({
      success: true,
      student: { email: newStudent.email, name: newStudent.name },
    });
  } catch (error) {
    console.error('Student Register Error:', error.message);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const loginStudent = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const student = await Student.findOne({ email }).select('+password');
    if (!student) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, student.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const token = generateToken(student._id);
    res.cookie('Studentlogintoken', token, req.app.locals.cookieConfig);

    return res.status(200).json({
      success: true,
      student: { email: student.email, name: student.name },
    });
  } catch (error) {
    console.error('Student Login Error:', error.message);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const logoutStudent = async (req, res) => {
  try {
    // Clear the cookie with multiple domain attempts
    const cookieOptions = [
      { ...req.app.locals.cookieConfig, domain: undefined },  // Try with no domain
      { ...req.app.locals.cookieConfig, domain: 'localhost' }, // Try localhost
      { ...req.app.locals.cookieConfig, domain: '.onrender.com' }, // Try .onrender.com
      { ...req.app.locals.cookieConfig, domain: 'everydaymeal-main.onrender.com' } // Try full domain
    ];

    // Try each cookie option
    cookieOptions.forEach(options => {
      try {
        res.clearCookie('Studentlogintoken', {
          ...options,
          maxAge: 0,
          expires: new Date(0)
        });
      } catch (e) {
        console.log('Cookie clear attempt failed for domain:', options.domain);
      }
    });

    // Always return success
    return res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Student Logout Error:', error.message);
    // Even on error, return success to ensure client state is cleared
    return res.status(200).json({
      success: true,
      message: 'Logged out'
    });
  }
};

export const isAuthStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.StudentId).select('-password');
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    // Refresh token on successful auth check
    const token = generateToken(student._id);
    res.cookie('Studentlogintoken', token, req.app.locals.cookieConfig);

    return res.status(200).json({ success: true, student });
  } catch (error) {
    console.error('Student Auth Check Error:', error.message);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};
