import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from 'axios';

// Configure axios defaults
axios.defaults.withCredentials = true;
axios.defaults.baseURL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';

// Add response interceptor to handle auth errors
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear local state on auth errors
      localStorage.removeItem('isAuthenticated');
    }
    return Promise.reject(error);
  }
);

export const Appcontext = createContext();

export const Appcontextprovider = ({ children }) => {
  const navigate = useNavigate();

  const [Student, setStudent] = useState(null);
  const [seller, setseller] = useState(null);

  const [isseller, setisseller] = useState(!!seller);
  const [ShowStudentLogin, setShowStudentLogin] = useState(false);
  const [ShowVendorLogin, setShowVendorLogin] = useState(false);
  const [MenuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    // Check student authentication status on app load
    const checkStudentAuth = async () => {
      try {
        const response = await axios.get('/api/Student/is-auth');
        if (response.data.success) {
          setStudent(response.data.student);
        }
      } catch (error) {
        console.log('Student not authenticated');
      }
    };

    // Check vendor authentication status on app load
    const checkVendorAuth = async () => {
      try {
        const response = await axios.get('/api/Vendor/is-auth');
        if (response.data.success) {
          setseller(response.data.vendor);
        }
      } catch (error) {
        console.log('Vendor not authenticated');
      }
    };

    checkStudentAuth();
    checkVendorAuth();
  }, []);

  useEffect(() => {
    setisseller(!!seller);
  }, [seller]);

  const clearStudent = async () => {
    try {
      await axios.post('/api/Student/logout');
    } catch (error) {
      console.error('Error logging out student:', error);
    } finally {
      // Always clear local state
      setStudent(null);
      navigate("/");
    }
  };

  const clearSeller = async () => {
    try {
      await axios.get('/api/Vendor/logout');
      setseller(null);
      navigate("/");
    } catch (error) {
      console.error('Error logging out vendor:', error);
    }
  };

  const value = {
    navigate,
    Student,
    setStudent: (student) => {
      if (student && seller) clearSeller();
      setStudent(student);
    },
    seller,
    setseller: (vendor) => {
      if (vendor && Student) clearStudent();
      setseller(vendor);
    },
    isseller,
    setisseller,
    ShowStudentLogin,
    setShowStudentLogin,
    ShowVendorLogin,
    setShowVendorLogin,
    MenuOpen,
    setMenuOpen,
    axios,
    logout: async () => {
      if (Student) await clearStudent();
      if (seller) await clearSeller();
    }
  };

  return (
    <Appcontext.Provider value={value}>
      {children}
    </Appcontext.Provider>
  );
};

export const useAppcontext = () => {
  return useContext(Appcontext);
};