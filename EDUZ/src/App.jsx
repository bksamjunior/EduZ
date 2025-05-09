import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Welcome from './pages/welcome';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

function AppLayout() {
  const location = useLocation();
  
  const hideFooterOn = ['/login', '/signup']; // Add more routes if needed
  const shouldShowFooter = !hideFooterOn.includes(location.pathname);

  const hideNavbarOn = ['/signup']; // Add more routes if needed
  const shouldShowNavbar = !hideNavbarOn.includes(location.pathname);

  return (
    <div className="app-container">
     {shouldShowNavbar && <Navbar />}
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Welcome />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="*" element={<h2>Page Not Found</h2>} />
        </Routes>
      </main>
      {shouldShowFooter && <Footer />}
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
