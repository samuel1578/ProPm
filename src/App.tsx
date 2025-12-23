import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import About from './pages/About';
import Courses from './pages/Courses';
import Pricing from './pages/Pricing';
import Contact from './pages/Contact';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import UserProfile from './pages/UserProfile';
import ProfileOnboarding from './pages/ProfileOnboarding';
import OAuthCallback from './pages/OAuthCallback';

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/profile/onboarding" element={<ProfileOnboarding />} />
            <Route path="/oauth/success" element={<OAuthCallback />} />
            <Route path="/oauth/failure" element={<OAuthCallback />} />
            <Route
              path="/"
              element={
                <Layout>
                  <Home />
                </Layout>
              }
            />
            <Route
              path="/about"
              element={
                <Layout>
                  <About />
                </Layout>
              }
            />
            <Route
              path="/courses"
              element={
                <Layout>
                  <Courses />
                </Layout>
              }
            />
            <Route
              path="/pricing"
              element={
                <Layout>
                  <Pricing />
                </Layout>
              }
            />
            <Route
              path="/contact"
              element={
                <Layout>
                  <Contact />
                </Layout>
              }
            />

            <Route
              path="/userprofile"
              element={
                <Layout>
                  <UserProfile />
                </Layout>
              }
            />
          </Routes>
        </Router>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
