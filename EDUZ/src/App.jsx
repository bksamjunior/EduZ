import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Welcome from './pages/Welcome';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Individual from './pages/Individual';
// import Student from './pages/Student';
// import School from './pages/School';
// import Organisation from './pages/Organisation';
// import Group from './pages/Group';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Watermark from './components/Watermark';

function AppLayout() {
  const location = useLocation();
  
  const hideFooterOn = []; // Add more routes if needed
  const shouldShowFooter = !hideFooterOn.includes(location.pathname);

  const hideNavbarOn = []; // Add more routes if needed
  const shouldShowNavbar = !hideNavbarOn.includes(location.pathname);

  const hideWatermarkOn = []; // Add more routes if needed
  const shouldShowWatermark = !hideWatermarkOn.includes(location.pathname);

 return (
    <div className="app-container">
     {shouldShowNavbar && <Navbar />}
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Welcome />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/individual" element={<Individual />} />
          <Route path="/student" element={<Signup />} />
          <Route path="/school" element={<Signup />} />
          <Route path="/organistion" element={<Signup />} />
          <Route path="/group" element={<Signup />} />
          <Route path="*" element={<h2>Page Not Found</h2>} />
        </Routes>
      </main>
      {shouldShowFooter && <Footer />}
      <Watermark />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  );
}

export default App;
