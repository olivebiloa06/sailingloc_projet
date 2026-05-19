import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "../pages/Home";
import BoatList from "../pages/BoatList";
import BoatDetail from "../pages/BoatDetail";
import Login from "../pages/Login";
import Register from "../pages/Register";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/boats" element={<BoatList />} />
        <Route path="/boats/:id" element={<BoatDetail />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;