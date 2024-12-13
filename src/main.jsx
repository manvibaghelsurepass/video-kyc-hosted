import {createRoot} from 'react-dom/client'
import './index.css'
import {store} from "/src/Store/Store.js";
import {Provider} from "react-redux";
import {Toaster} from "/src/components/ui/toaster"
import {BrowserRouter} from "react-router-dom";
import './i18n';
import ThemeProvider from './components/theme-provider.jsx';
import React from "react";
import App from "./App.jsx";
import {videoKycAxiosInstance} from "/src/axiosinstance/axiosinstance.js";

const queryStrings = window.location.search
    .slice(1)
    .split("&")
    .reduce((a, b) => {
        console.log(a);
        b = b.split("=");
        a[b[0]] = decodeURIComponent(b[1]);
        return a;
    }, {});

if (!localStorage.getItem('signature')) {
    if (queryStrings?.signature) {
        localStorage.setItem('signature', queryStrings?.signature);
    }
}

if (!localStorage.getItem('type')) {
    if (queryStrings?.type) {
        localStorage.setItem('type', queryStrings?.type);
    }
}

if (!localStorage.getItem('superflow_token')) {

    if (queryStrings?.superflow_token) {
        videoKycAxiosInstance.defaults.headers.common["Authorization"] = `Bearer ${queryStrings?.superflow_token}`;
        console.log("Video Kyc", queryStrings);
        localStorage.setItem('superflow_token', queryStrings?.superflow_token);
    }
}

if (!localStorage.getItem('token')) {
    if (queryStrings?.token) {
        localStorage.setItem('token', queryStrings?.token);
    }
}

createRoot(document.getElementById('root')).render(
    <Provider store={store}>
        <ThemeProvider defaultTheme={'light'} storageKey="vite-ui-theme">
            <BrowserRouter basename={'/'}>
                <App queryStrings={queryStrings}/>
            </BrowserRouter>
        </ThemeProvider>
        <Toaster/>
    </Provider>
)
