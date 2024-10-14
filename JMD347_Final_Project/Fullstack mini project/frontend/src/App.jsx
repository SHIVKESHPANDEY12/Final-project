import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import LoginPage from './components/login/Login';
import Dashboard from './Pages/Dashboard.jsx';
import "./App.css";
import Quiz from './Pages/Quiz.jsx';
import Courses from './Pages/Courses.jsx';
import Discussion from './Pages/Discussion.jsx';
import AdminPage from './Pages/AdminPage.jsx';
import QuizDetails from './Pages/QuizDetails.jsx';
import axios from "./config/axiosConfig.js";
import { saveUser } from "./data/userSlice.js";

const AppRouter = () => {
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user.user);
  const isAuthenticated = !!user?.email;
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/users/profile", {
          withCredentials: true, // Include credentials in the request
        });

        if (response.data.success) {
          dispatch(saveUser(response.data.user));
        } else {
          console.error("Error fetching user data:", response.data.message);
        }
      } catch (error) {
        console.error("Error fetching user data:", error?.response?.data?.message || error.message);
      } finally {
        setLoading(false);
      }
    };

    // Fetch user data if not already present
    if (!user || !user.email) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, [dispatch, user]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="loader">Loading...</div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {isAuthenticated ? (
          <>
            {user.userType === "admin" && (
              <>
                <Route path="/admin" element={<AdminPage />} />
                <Route path="*" element={<Navigate to="/admin" />} />
              </>
            )}

            {user.userType === "employee" && (
              <>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/courses" element={<Courses />} />
                <Route path="/discussion" element={<Discussion />} />
                <Route path="/quiz/:id" element={<Quiz />} />
                <Route path="/quizdetails/:id" element={<QuizDetails />} />
                <Route path="*" element={<Navigate to="/dashboard" />} />
              </>
            )}
          </>
        ) : (
          <>
            <Route path="/" element={<LoginPage />} />
            <Route path="*" element={<Navigate to="/" />} />
          </>
        )}
      </Routes>
    </Router>
  );
};

export default AppRouter;
