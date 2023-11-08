import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import SideNavbar from "./components/SideNavbar";
import MainScreen from "./components/MainScreen";
import About from "./components/About";
import Services from "./components/Services";
import Contact from "./components/Contact";
import Home1 from "./components/home1";
import Home2 from "./components/home2";
import History from "./components/History";
import Team from "./components/Team";
import WebDevelopment from "./components/WebDevelopment";
import MobileDevelopment from "./components/MobileDevelopment";
import EmailUs from "./components/EmailUs";
import CallUs from "./components/CallUs";
import FormComponent from "./components/FormComponent";
import FormList from "./components/FormList";
import FormEdit from "./components/FormEdit";

function App() {
  return (
    <Router basename="/uniboAssignment">
      <div className="d-flex">
        <SideNavbar />
        <Routes>
          <Route path="/" element={<MainScreen />} />
          <Route path="/home1.1" element={<Home1 />} />
          <Route path="/home1.2" element={<Home2 />} />
          <Route path="/about" element={<About />} />
          <Route path="/about/history" element={<History />} />
          <Route path="/about/team" element={<Team />} />
          <Route path="/services" element={<Services />} />
          <Route path="/services/web" element={<WebDevelopment />} />
          <Route path="/services/mobile" element={<MobileDevelopment />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/contact/email" element={<EmailUs />} />
          <Route path="/contact/phone" element={<CallUs />} />
          <Route path="/form" element={<FormComponent />} />
          <Route path="/formList" element={<FormList />} />
          <Route path="/formEdit/:fileName" element={<FormEdit />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
