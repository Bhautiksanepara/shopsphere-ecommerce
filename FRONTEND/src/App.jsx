import { useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { ThemeProvider } from "./context/ThemeContext";
import { ToastProvider } from "./context/ToastContext";
import AppRoutes from "./routes/AppRoutes";
import LoadingSplash from "./components/common/LoadingSplash";
import { refreshAccessToken } from "./redux/slices/authSlice";

function App() {
  const [darkMode, setDarkMode] = useState(
    () => localStorage.getItem("shopsphere-theme") === "dark",
  );
  const [isBackendAwake, setIsBackendAwake] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    localStorage.setItem("shopsphere-theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  useEffect(() => {
    if (!isBackendAwake) return;
    const refreshToken = localStorage.getItem("refreshToken");
    if (refreshToken) {
      dispatch(refreshAccessToken());
    }
  }, [dispatch, isBackendAwake]);

  const themeValue = useMemo(
    () => ({
      darkMode,
      toggleDarkMode: () => setDarkMode((prev) => !prev),
    }),
    [darkMode],
  );

  return (
    <ThemeProvider value={themeValue}>
      <ToastProvider>
        {isBackendAwake ? (
          <AppRoutes />
        ) : (
          <LoadingSplash onAwake={() => setIsBackendAwake(true)} />
        )}
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;
