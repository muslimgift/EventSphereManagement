import { createContext, useState } from "react";

export const userContext = createContext();

export default function UserProvider({ children }) {
  const getSavedUser = () => {
    try {
      const saved = localStorage.getItem("user") || sessionStorage.getItem("user");

      // Avoid parsing the string "undefined" or null
      if (!saved || saved === "undefined") return null;

      return JSON.parse(saved);
    } catch (error) {
      console.error("Error parsing user from storage:", error);
      return null;
    }
  };

  const [user, setUser] = useState(getSavedUser);

  const LoginUser = (data, remember) => {
    if (remember) {
      localStorage.setItem("user", JSON.stringify(data));
    } else {
      sessionStorage.setItem("user", JSON.stringify(data));
    }
    setUser(data);
  };

  const Profileupdate = (data) => {
    try {
      if (localStorage.getItem("user")) {
        localStorage.setItem("user", JSON.stringify(data));
      } else if (sessionStorage.getItem("user")) {
        sessionStorage.setItem("user", JSON.stringify(data));
      }
      setUser(data);
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  const LogoutUser = () => {
    localStorage.removeItem("user");
    sessionStorage.removeItem("user");
    setUser(null);
  };

  return (
    <userContext.Provider value={{ user, LoginUser, LogoutUser, Profileupdate }}>
      {children}
    </userContext.Provider>
  );
}
