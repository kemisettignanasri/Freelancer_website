import React, { useState, useEffect, useContext } from "react";
import { freelancerLoginContext } from "./freelancerLoginContext";
import { employerLoginContext } from "./employerLoginContext";


function FreelancerLoginStore({ children }) {
    const [currentFreelancer, setCurrentFreelancer] = useState(null);
      const [freelancerLoginStatus, setFreelancerLoginStatus] = useState(false);
      const [err, setErr] = useState("");
      const [profileListing,setProfileListing]=useState([]);
        const { currentEmployer, setCurrentEmployer } = useContext(employerLoginContext);
    
      async function loginFreelancer(userCred) {
        
        try {
          let res = await fetch(`http://localhost:4000/freelancers-Api/login`, {
            method: "POST",
            headers: { "Content-type": "application/json" },
            body: JSON.stringify(userCred),
          });
          let requestres = await res.json();
          
          console.log("Login response:", requestres);

         
    
          if(requestres.message === "login success") {
            let currentUser = requestres.user;
            setCurrentFreelancer(currentUser);
            setFreelancerLoginStatus(true);
            setErr("");
            sessionStorage.setItem('token', requestres.token);
          } else{
            setCurrentFreelancer(null);
            setFreelancerLoginStatus(false);
            setErr(requestres.message);
          }
        } catch (error) {
          setErr(error.message);
        }
      }

      useEffect(() => {
        console.log("Updated Freelancer:", currentFreelancer);
    }, [currentFreelancer]);
    
      function logoutFreelancer() {
        setCurrentFreelancer(null);
        setFreelancerLoginStatus(false);
        setErr("");
        sessionStorage.removeItem('token');
      }
      async function fetchUsers() {
        try {
            const res = await fetch("http://localhost:4000/freelancers-Api/profileList");
            if (res.status !== 200) {
                throw new Error(`HTTP error! Status: ${res.status}`);
            }
            const data = await res.json();
            console.log("Fetched profileLists:", data.payload); 
            console.log("profiles",data.payload)// Log fetched data
            setProfileListing(data.payload);
        } catch (error) {
            console.error("Error while fetching data:", error.message);
        }
    }
      useEffect(() => {
        fetchUsers();
    }, [currentEmployer]);
      
    
      return (
        <freelancerLoginContext.Provider
          value={{ loginFreelancer, logoutFreelancer, freelancerLoginStatus, err, currentFreelancer, setCurrentFreelancer ,profileListing}}
        >
          {children}
        </freelancerLoginContext.Provider>
      );
}

export default FreelancerLoginStore;