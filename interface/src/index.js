import React from 'react';
import ReactDOM from 'react-dom/client';
import Home from './components/App';
// import About from "./pages/About";
// import Contact from "./pages/Contact";
import {BrowserRouter as Router, Routes, Route} from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import Layout from "./components/page-components/Layout";

const root = ReactDOM.createRoot(document.getElementById('root'));



function App() {
    return (
        <Router>
            <Layout>
                <Routes>
                    <Route path="/" element={<Home/>}/>
                    {/*<Route path="/about" element={<About />} />*/}
                    {/*<Route path="/contact" element={<Contact />} />*/}
                </Routes>
            </Layout>
        </Router>
    );
}

root.render(
    <React.StrictMode>
        <App/>
    </React.StrictMode>
);