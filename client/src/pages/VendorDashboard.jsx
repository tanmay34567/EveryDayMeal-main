import React, { useState, useEffect, useRef } from "react";
import { useAppcontext } from "../context/Appcontext";
import { assets } from "../assets/assets";
import { toast } from "react-hot-toast";

const capitalize = (str) => {
  if (!str) return "";
  return str
    .split(" ")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

const VendorDashboard = () => {
  const [date, setDate] = useState("");
  const [day, setDay] = useState("");
  const [savedMenu, setSavedMenu] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  const [menuData, setMenuData] = useState({
    breakfast: { items: "", startTime: "", startPeriod: "AM", endTime: "", endPeriod: "AM" },
    lunch: { items: "", startTime: "", startPeriod: "PM", endTime: "", endPeriod: "PM" },
    dinner: { items: "", startTime: "", startPeriod: "PM", endTime: "", endPeriod: "PM" },
  });

  const { seller, axios, setShowVendorLogin } = useAppcontext();
  const formRef = useRef(null);

  // Check if we're logged in as a vendor
  const [isAuthenticated, setIsAuthenticated] = useState(!!seller);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Update authentication status when seller changes
    setIsAuthenticated(!!seller);
  }, [seller]);

  useEffect(() => {
    const fetchMenu = async () => {
      // Only try to fetch menu if we're authenticated
      if (!isAuthenticated || !seller || !seller.email) {
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      try {  
        const response = await axios.get('/api/Vendor/menu');
        
        if (response.data.success && response.data.data) {
          setSavedMenu(response.data.data);
        }
      } catch (error) {
        // Only log the error, don't show toast as this is expected for new vendors
        console.error('Error fetching menu:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMenu();
  }, [isAuthenticated, seller, axios]);

  const isDateAndDayMatching = () => {
    if (!date || !day) return false;

    const selectedDate = new Date(date);
    const selectedDayIndex = selectedDate.getDay(); // 0 = Sunday, 1 = Monday, etc.

    const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const actualDay = daysOfWeek[selectedDayIndex];

    return actualDay === day;
  };

  const handleChange = (meal, field, value) => {
    setMenuData((prev) => ({
      ...prev,
      [meal]: {
        ...prev[meal],
        [field]: value,
      },
    }));
  };

  const formatTime = (time, period) => {
    return time ? `${time} ${period}` : "";
  };

  const handleSubmit = async () => {
    if (!date || !day) {
      toast.error("Please enter date and day.");
      return;
    }

    if (!isDateAndDayMatching()) {
      toast.error("Selected day and date do not match. Please correct them.");
      return;
    }

    try {
      const formattedData = {
        vendorEmail: seller.email,
        vendorName: seller.name,
        date,
        day,
        meals: {},
      };

      for (const meal in menuData) {
        formattedData.meals[meal] = {
          items: menuData[meal].items,
          startTime: formatTime(menuData[meal].startTime, menuData[meal].startPeriod),
          endTime: formatTime(menuData[meal].endTime, menuData[meal].endPeriod),
        };
      }

      const response = await axios.post('/api/Vendor/menu', formattedData);

      if (response.data.success) {
        setSavedMenu(formattedData);
        setIsEditing(false);
        toast.success(response.data.message || "Menu saved successfully!");
      } else {
        toast.error(response.data.message || "Failed to save menu.");
      }
    } catch (error) {
      console.error('Error saving menu:', error);
      toast.error(error.response?.data?.message || "An error occurred while saving the menu.");
    }
  };

  const handleDelete = async () => {
    try {
      const response = await axios.delete('/api/Vendor/menu');
      
      if (response.data.success) {
        setSavedMenu(null);
        setIsEditing(false);
        toast.success(response.data.message || "Menu deleted successfully.");
      } else {
        toast.error(response.data.message || "Failed to delete menu.");
      }
    } catch (error) {
      console.error('Error deleting menu:', error);
      toast.error(error.response?.data?.message || "An error occurred while deleting the menu.");
    }
  };

  const handleEdit = () => {
    if (!savedMenu) return;

    setDate(savedMenu.date);
    setDay(savedMenu.day);

    const menuCopy = {};
    for (const meal in savedMenu.meals) {
      const { items, startTime, endTime } = savedMenu.meals[meal];
      const [startT, startP] = startTime.split(" ");
      const [endT, endP] = endTime.split(" ");

      menuCopy[meal] = {
        items,
        startTime: startT || "",
        startPeriod: startP || (meal === "breakfast" ? "AM" : "PM"),
        endTime: endT || "",
        endPeriod: endP || (meal === "breakfast" ? "AM" : "PM"),
      };
    }

    setMenuData(menuCopy);
    setIsEditing(true);

    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleResetMeal = (meal) => {
    setMenuData((prev) => ({
      ...prev,
      [meal]: {
        items: "",
        startTime: "",
        startPeriod: meal === "breakfast" ? "AM" : "PM",
        endTime: "",
        endPeriod: meal === "breakfast" ? "AM" : "PM",
      },
    }));
  };

  return (
    <div className="relative w-full min-h-screen overflow-hidden">
      {/* Fixed Background Image */}
      <img
        src={assets.bg}
        alt="Background"
        className="fixed top-0 left-0 w-full h-full object-cover z-[-1] animate-slow-spin"
      />

      {/* Authentication Check */}
      {!isAuthenticated ? (
        <div className="max-w-4xl mx-auto bg-white shadow-xl rounded-2xl p-8 mt-10">
          <h1 className="text-4xl font-bold text-center text-indigo-700 mb-8">Vendor Dashboard</h1>
          <div className="text-center p-6 bg-yellow-50 rounded-lg border border-yellow-200">
            <p className="text-lg text-yellow-800 mb-4">You need to log in as a vendor to access this page.</p>
            <button 
              onClick={() => setShowVendorLogin(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-md"
            >
              Log In
            </button>
          </div>
        </div>
      ) : isLoading ? (
        <div className="max-w-4xl mx-auto bg-white shadow-xl rounded-2xl p-8 mt-10">
          <h1 className="text-4xl font-bold text-center text-indigo-700 mb-8">
            <span>{capitalize(seller?.name) || "Vendor"}</span> Dashboard
          </h1>
          <div className="flex justify-center items-center p-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            <p className="ml-3 text-lg text-gray-600">Loading your menu...</p>
          </div>
        </div>
      ) : (
        <div ref={formRef} className="max-w-4xl mx-auto bg-white shadow-xl rounded-2xl p-8 mt-10">
        <h1 className="text-4xl font-bold text-center text-indigo-700 mb-8">
          <span>{capitalize(seller?.name) || "Vendor"}</span> Dashboard
        </h1>

        {/* Date & Day */}
        <div className="mb-6">
          <label className="block font-semibold text-lg mb-1 text-gray-700">Select Day</label>
          <select
            value={day}
            onChange={(e) => setDay(e.target.value)}
            className="w-full p-3 rounded-lg border border-gray-300 shadow-sm"
          >
            <option value="">Day</option>
            {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>

        <div className="mb-6">
          <label className="block font-semibold text-lg mb-1 text-gray-700">Select Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full p-3 rounded-lg border border-gray-300"
          />
        </div>

        {/* Menu Input */}
        {Object.keys(menuData).map((meal) => (
          <div key={meal} className="mb-8 bg-gray-50 border border-gray-200 p-5 rounded-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold capitalize text-indigo-600">{meal}</h2>
              {isEditing && (
                <button
                  onClick={() => handleResetMeal(meal)}
                  className="text-sm text-red-600 font-medium hover:underline"
                >
                  Reset {meal}
                </button>
              )}
            </div>

            <label className="block font-medium mb-1 text-gray-700">Menu Items</label>
            <input
              type="text"
              value={menuData[meal].items}
              onChange={(e) => handleChange(meal, "items", e.target.value)}
              placeholder={`Enter ${meal} menu...`}
              className="mb-4 w-full p-3 rounded-lg border border-gray-300"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Start Time */}
              <div>
                <label className="block font-medium mb-1 text-gray-700">Start Time</label>
                <div className="flex gap-2">
                  <input
                    type="time"
                    value={menuData[meal].startTime}
                    onChange={(e) => handleChange(meal, "startTime", e.target.value)}
                    className="w-full p-3 rounded-lg border border-gray-300"
                  />
                  <select
                    value={menuData[meal].startPeriod}
                    onChange={(e) => handleChange(meal, "startPeriod", e.target.value)}
                    className="p-3 border border-gray-300 rounded-lg"
                  >
                    <option>AM</option>
                    <option>PM</option>
                  </select>
                </div>
              </div>

              {/* End Time */}
              <div>
                <label className="block font-medium mb-1 text-gray-700">End Time</label>
                <div className="flex gap-2">
                  <input
                    type="time"
                    value={menuData[meal].endTime}
                    onChange={(e) => handleChange(meal, "endTime", e.target.value)}
                    className="w-full p-3 rounded-lg border border-gray-300"
                  />
                  <select
                    value={menuData[meal].endPeriod}
                    onChange={(e) => handleChange(meal, "endPeriod", e.target.value)}
                    className="p-3 border border-gray-300 rounded-lg"
                  >
                    <option>AM</option>
                    <option>PM</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        ))}

        <button
          onClick={handleSubmit}
          className="mt-6 w-full bg-indigo-600 hover:bg-indigo-700 text-white text-lg font-semibold py-3 rounded-xl"
        >
          {isEditing ? "Update Menu" : "Save Menu & Timings"}
        </button>

        {/* Show Saved Menu */}
        {savedMenu && (
          <div className="mt-10 p-6 border border-indigo-200 bg-indigo-50 rounded-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-2xl font-bold text-indigo-800">
                Menu for {savedMenu.day} ({savedMenu.date})
              </h3>
              <div className="flex gap-4">
                <button
                  onClick={handleEdit}
                  className="text-blue-600 font-semibold text-sm hover:underline"
                >
                  Edit Menu
                </button>
                <button
                  onClick={handleDelete}
                  className="text-red-600 font-semibold text-sm hover:underline"
                >
                  Delete Menu
                </button>
              </div>
            </div>
            {Object.keys(savedMenu.meals).map((meal) => (
              <div key={meal} className="mb-4">
                <h4 className="text-lg font-semibold text-gray-800 capitalize">{meal}</h4>
                <p><strong>Items:</strong> {savedMenu.meals[meal].items}</p>
                <p><strong>Time:</strong> {savedMenu.meals[meal].startTime} - {savedMenu.meals[meal].endTime}</p>
              </div>
            ))}
          </div>
        )}
      </div>
      )}
    </div>
  );
};

export default VendorDashboard;
