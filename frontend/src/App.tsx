import * as React from "react"
import {
  ChakraProvider,
  Box,
  theme,
} from "@chakra-ui/react"
import { ColorModeSwitcher } from "./ColorModeSwitcher";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Landing from "./pages/Landing";
import Login from "./pages/RegisterCustomer";
import RegisterCustomer from "./pages/RegisterCustomer";
import RegisterOwner from "./pages/RegisterOwner";
import LoginCustomer from "./pages/LoginCustomer";
import LoginOwner from "./pages/LoginOwner";
import { useAppSelector } from "./typed.hooks/hooks";
import SetAddress from "./pages/SetAddress";
import Home from "./pages/Home";
import CreateJamRoom from "./pages/CreateJamRoom";
import IndividualJamPad from "./pages/IndividualJamPad";
import Slots from "./pages/Slots";

export const App = () => {

  const { user } = useAppSelector(state => state.user);

  return (
    <ChakraProvider theme={theme}>
      <Box textAlign="center" fontSize="xl">
        <Router>
          <Navbar user={user} />
          <Routes>
            <Route path="/register/customer" element={<RegisterCustomer />} />
            <Route path="/register/owner" element={<RegisterOwner />} />
            <Route path="/login/customer" element={<LoginCustomer />} />
            <Route path="/login/owner" element={<LoginOwner />} />
            <Route path="/set/address" element={<SetAddress />} />
            <Route path="/home" element={<Home />} />
            <Route path="/create/room" element={<CreateJamRoom />} />
            <Route path="/get/pad/:id" element={<IndividualJamPad />} />
            <Route path="/slots" element={<Slots />} />
            <Route path="/" element={<Landing />} />
          </Routes>
        </Router>
      </Box>
    </ChakraProvider>
  )
}
