import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import { Provider } from "react-redux";
import { store } from "./app/store";

import App from "./App";
import PackageProvider from "./context/PackageProvider";
import { ModalProvider } from "./context/ModalProvider";

import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <BrowserRouter>
      <ModalProvider>
        <PackageProvider>
          <App />
        </PackageProvider>
      </ModalProvider>
    </BrowserRouter>
  </Provider>,
);
