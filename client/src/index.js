import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux"; // Redux store provider
import { BrowserRouter } from "react-router-dom"; // Router provider
import store from "./app/store"; // Your Redux store
import App from "./App"; // Main App component
import "bootstrap/dist/css/bootstrap.min.css"; // Bootstrap styles
import "./App.css"; // Custom styles

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <Provider store={store}>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </Provider>
);
