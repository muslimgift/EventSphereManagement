import { createContext, useState } from "react";

export const userContext = createContext();

export default function UserProvider({ children }) {

const [user, setUser] = useState(() => {
  const saved = localStorage.getItem("user") || sessionStorage.getItem("user");
  return saved ? JSON.parse(saved) : null;
});
const LoginUser = (data, remember) => {
  if (remember) {
    localStorage.setItem("user", JSON.stringify(data));
  } else {
    sessionStorage.setItem("user", JSON.stringify(data));
  }
  setUser(data); // Always set session state
};


const LogoutUser = () => {
  localStorage.removeItem("user");
  setUser(null);
};

  return (
    <userContext.Provider value={{ user, LoginUser, LogoutUser }}>
      {children}
    </userContext.Provider>
  );
}
