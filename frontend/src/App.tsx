import React, { useState } from "react";
import { Provider } from "react-redux";
import store, { persistor } from "./store";
import { PersistGate } from "redux-persist/integration/react";
import Router from "./common/router/Router";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ProfileWindow from "./pages/auth/ProfileWindow";
import { AuthProvider } from "./context/AuthContext";

const App: React.FC = () => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  return (
    <div className="App relative">
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <AuthProvider>
            <Router openProfile={() => setIsProfileOpen(true)} />
            <ProfileWindow
              isOpen={isProfileOpen}
              onClose={() => {
                console.log("Profile window closed");
                setIsProfileOpen(false);
              }}
            />
            <ToastContainer />
          </AuthProvider>
        </PersistGate>
      </Provider>
    </div>
  );
};

export default App;
