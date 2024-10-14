// Mock API to fetch employee data, statistics, top performers, and discussions
import axios from "../config/axiosConfig";

export const fetchEmployees = async (department, team) => {
  try {
    // Make an API call to the backend to fetch statistics
    const response = await axios.get(
      "http://localhost:5000/api/users/getAllUserStatistics"
    );

    // Return the fetched data
    const allEmployees = response.data.data;
    return allEmployees.filter(
      (employee) =>
        (!department || employee.department._id === department) &&
        (!team || employee.team._id === team)
    );
  } catch (error) {
    console.error("Error fetching statistics:", error);
    return null; // Return null or handle error appropriately
  }

  // Filter based on department and team
};

export const fetchStatistics = async () => {
  try {
    // Make an API call to the backend to fetch statistics
    const response = await axios.get(
      "http://localhost:5000/api/users/fetchStatistics"
    );

    // Return the fetched data
    return response.data.data; // Extract the 'data' from the API response
  } catch (error) {
    console.error("Error fetching statistics:", error);
    return null; // Return null or handle error appropriately
  }
};

export const fetchTopPerformers = async () => {
  try {
    const response = await axios.get(
      "http://localhost:5000/api/users/topPerformers"
    );
    return response.data.data; // Extract the 'data' from the API response
  } catch (error) {
    console.error("Error fetching top performers:", error);
    return [];
  }
};

export const fetchDiscussions = async () => {
  try {
    const response = await axios.get(
      "http://localhost:5000/api/users/getDiscussionMessages"
    );

    return response.data.messages; // Return the complete response
  } catch (error) {
    console.error("Error fetching discussions:", error);
    return {
      success: false,
      message: "Failed to fetch discussions",
    };
  }
};
