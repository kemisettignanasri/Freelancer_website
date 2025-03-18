import React, { useState, useEffect } from 'react';
import { useContext } from 'react';
import { employerLoginContext } from './employerLoginContext';
import { freelancerLoginContext } from './freelancerLoginContext';

function EmployerLoginStore({ children }) {
  const [currentEmployer, setCurrentEmployer] = useState(null);
  const [employerLoginStatus, setEmployerLoginStatus] = useState(false);
  
  const [err, setErr] = useState("");
  const [jobListing,setJobListing] = useState([]);

  // const {currentFreelancer,setCurrentFreelancer} = useContext(freelancerLoginContext)

  async function loginEmployer(userCred) {
    console.log("users",userCred)
    try {
      let res = await fetch(`http://localhost:4000/employers-Api/login`, {
        method: "POST",
        headers: { "Content-type": "application/json" },
        body: JSON.stringify(userCred),
      });
      let requestres = await res.json();
      
      console.log("Login response:", requestres);

      if (requestres.message === 'login success') {
        setCurrentEmployer(requestres.employer);
        setEmployerLoginStatus(true);
        setErr("");
        sessionStorage.setItem('token', requestres.token);
      } else {
        setCurrentEmployer(null);
        setEmployerLoginStatus(false);
        setErr(requestres.message);
      }
    } catch (error) {
      setErr(error.message);
    }
  }



  function logoutEmployer() {
    setCurrentEmployer(null);
    setEmployerLoginStatus(false);
    setErr("");
    sessionStorage.removeItem('token');
  }
 
  async function jobLists() {
    try {
        let res = await fetch("http://localhost:4000/employers-Api/employers/getAllJobListings");

        let jobListsRes = await res.json();
        if (jobListsRes.message === "All job listings fetched successfully!") {
            setJobListing(jobListsRes.payload);
          
            console.log("Jobs:", jobListsRes.payload);
        } else {
            setErr(jobListsRes.message);
        }
    } catch (error) {
        setErr(error.message);
        console.error("Error fetching job listings:", error);
    }
}

  
  useEffect(() => {
    jobLists();
    
}, [ ]);

  return (
    <employerLoginContext.Provider
      value={{ loginEmployer, logoutEmployer, employerLoginStatus, err, currentEmployer, setCurrentEmployer , jobListing }}
    >
      {children}
    </employerLoginContext.Provider>
  );
}

export default EmployerLoginStore;