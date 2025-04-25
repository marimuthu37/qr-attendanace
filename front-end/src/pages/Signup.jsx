import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Signup = () => {
  const [formData, setFormData] = useState({ username: "", password: "", role: "student" });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(""); // Clear previous messages

    try {
      await axios.post("http://localhost:5000/signup", formData);
      setMessage("Signup successful! Redirecting...");
      setTimeout(() => navigate("/login"), 1000);
    } catch (error) {
      setMessage("Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-sm p-6 bg-white rounded-xl shadow-md">
        <h2 className="text-2xl font-bold text-center mb-6">Signup</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="username"
            onChange={handleChange}
            placeholder="Username"
            className="w-full p-2 border border-gray-300 rounded"
            required
          />
          <input
            type="password"
            name="password"
            onChange={handleChange}
            placeholder="Password"
            className="w-full p-2 border border-gray-300 rounded"
            required
          />
          <select
            name="role"
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded"
          >
            <option value="student">Student</option>
            <option value="faculty">Faculty</option>
          </select>
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 rounded text-white transition ${
              loading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading ? "Signing up..." : "Signup"}
          </button>
        </form>
        {message && (
          <p className={`text-center mt-4 text-sm ${message.includes("failed") ? "text-red-500" : "text-green-500"}`}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
};

export default Signup;
