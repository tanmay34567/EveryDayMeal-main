import React from 'react';
import Mainbanner from '../components/Mainbanner';
import { useAppcontext } from '../context/Appcontext';

const Home = () => {
  const { Student, seller } = useAppcontext();

  // Only show Mainbanner if NOT logged in
  const isLoggedIn = Student || seller;

  return (
    <div className='mt-10'>
      {!isLoggedIn && <Mainbanner />}
      
    </div>
  );
};

export default Home;
