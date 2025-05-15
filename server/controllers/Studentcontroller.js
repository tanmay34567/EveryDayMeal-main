// controllers/studentController.js
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Student from '../models/Student.js';

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

    const token = jwt.sign({ id: newStudent._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.cookie('Studentlogintoken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

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

    const student = await Student.findOne({ email });
    if (!student) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, student.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const token = jwt.sign({ id: student._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.cookie('Studentlogintoken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

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
    res.clearCookie('Studentlogintoken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
    });
    return res.status(200).json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const isAuthStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.StudentId).select('-password');
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

    return res.status(200).json({ success: true, student });
  } catch (error) {
    console.error('Student Auth Check Error:', error.message);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};
