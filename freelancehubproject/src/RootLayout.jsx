import Header from "./components/header/Header";
import { Outlet } from "react-router-dom";
import React from 'react'


function RootLayout() {
  return (
    <div>
        <Header />
        <div style={{ minHeight: "100vh" }} className='layout'>
            <Outlet />
        </div>
    </div>
  )
}

export default RootLayout