import React, { useState, useEffect, useContext } from "react";
import { employerLoginContext } from '../../contexts/employerLoginContext';
import { freelancerLoginContext } from "../../contexts/freelancerLoginContext";
import { useForm } from "react-hook-form";
import "./EmployerDashboard.css";
import { FaRegUser } from "react-icons/fa";

function EmployerDashboard() {
  const [activeSection, setActiveSection] = useState("dashboard");
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();
  const { currentEmployer, setCurrentEmployer } = useContext(employerLoginContext);
  const [isEditing, setIsEditing] = useState(false);
  const {profileListing} = useContext(freelancerLoginContext)
  const [selectedFreelancer,setSelectedFreelancer]=useState(null)
  const [searchQuery, setSearchQuery] = useState("");
  

  useEffect(() => {
    if (activeSection === "profile" && currentEmployer) {
      setValue("fullName", currentEmployer?.fullName || "");
      setValue("email", currentEmployer?.email || "");
      setValue("mobileNumber", currentEmployer?.mobileNumber || "");
      setValue("companyname", currentEmployer?.companyname || "");
      setValue("location", currentEmployer?.location || "");
    }
  }, [activeSection, currentEmployer, setValue]);
 //profile
  const onSubmitProfile = async (data) => {
    console.log(currentEmployer._id);
    if (!currentEmployer?._id) {
      console.error("Employer ID is missing");
      return;
    }
  
    try {
      const response = await fetch(`http://localhost:4000/employers-Api/employer/${currentEmployer._id}/editProfile`, {
        method: "PUT", // 🔹 Changed to PUT request
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionStorage.getItem('token')}`,

        },
        body: JSON.stringify({
          fullName: data.fullName,
          email: data.email,
          mobileNumber: data.mobileNumber,
          companyname: data.companyname,
          location: data.location,
        }),
      });
  
      if (!response.ok) {
        throw new Error(`Failed to update employer profile: ${response.statusText}`);
      }
  
      const updatedEmployerData = await response.json(); // 🔹 Get updated data
  
      if (updatedEmployerData.message === "Profile updated successfully!") {
        setCurrentEmployer(updatedEmployerData.updatedEmployer); // 🔹 Store updated employer
        setIsEditing(false);
      } else {
        throw new Error(updatedEmployerData.message);
      }
  
    } catch (error) {
      console.error("Error updating profile:", error.message);
    }
  };
  

  const [formData, setFormData] = useState({
    companyname: "",
    jobTitle: "",
    status: "Active",
    pay: "",
  });

  const handleViewProfile = (freelancer) => {
    setSelectedFreelancer(freelancer);
  };

  const handleCloseProfile = () => {
    setSelectedFreelancer(null);
  };
  const filteredFreelancers = profileListing.filter((freelancer) => {
    const query = searchQuery.toLowerCase();
    return (
      freelancer.fullName.toLowerCase().includes(query) ||
      freelancer.pastCompanies?.toLowerCase().includes(query) ||
      freelancer.skills?.toLowerCase().includes(query)
    );
  });
  
  //job listing
  const [jobPostings, setJobPostings] = useState([]);
  const [applications, setApplications] = useState([]);

  async function jobListing(jobdetails) {
    let res = await fetch(`http://localhost:4000/employers-Api/employer/${currentEmployer.fullName}/joblisting`, { 
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(jobdetails),
    });
  
    let data = await res.json();
    if (data.payload) {
      setJobPostings(data.payload); 
    }
  }
  const fetchJobListings = async () => {
    try {
      const res = await fetch(`http://localhost:4000/employers-Api/employer/${currentEmployer._id}/getJobListing`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem('token')}`,
        },
      });
  
      if (!res.ok) {
        throw new Error(`Failed to fetch job listings: ${res.statusText}`);
      }
  
      const data = await res.json();
      if (data.payload) {
        setJobPostings(data.payload); // Update the jobPostings state
      }
    } catch (error) {
      console.error("Error fetching job listings:", error);
    }
  };
  useEffect(() => {
    if (currentEmployer?._id) {
      fetchJobListings(); // Fetch job listings when the employer logs in
    }
  }, [currentEmployer]);
  //to get applications
useEffect(() => {
  const fetchApplications = async () => {
    try {
      const res = await fetch(`http://localhost:4000/employers-Api/employer/${currentEmployer.fullName}/applications`);

      if (!res.ok) {
        throw new Error(`HTTP error! Status: ${res.status}`);
      }

      const data = await res.json();

      console.log("Fetched Applications:", data);

      if (data && data.payload && Array.isArray(data.payload)) {
        setApplications(data.payload); // Use setApplications instead of setJobPostings
      } else {
        setApplications([]);
      }
    } catch (error) {
      console.error("Error fetching applications:", error);
    }
  };

  if (currentEmployer?.fullName) {
    fetchApplications();
  }
}, [currentEmployer]);
 
useEffect(() => {
  console.log("Updated Job Postings State:", jobPostings);
}, [jobPostings]);
  const handlePostJob = async () => {
    const newJob = {
      id: Date.now(),
      companyname: formData.companyname,
      jobTitle: formData.jobTitle,
      status: formData.status,
      pay: formData.pay,
      employerId: currentEmployer._id,
    };

    setJobPostings((prev) => [...prev, newJob]);
    setFormData({ companyname: formData.companyname, jobTitle: "", status: "Active", pay: "" });

    await jobListing(newJob);
  };

  const deleteJob = async (jobId) => {
    try {
      let res = await fetch(`http://localhost:4000/employers-Api/employer/${currentEmployer.fullName}/joblisting/${jobId}`, {
        method: "DELETE",
      });
  
      let data = await res.json();
  
      if (data.payload) {
        setJobPostings(data.payload); 
      }
    } catch (error) {
      console.error("Error deleting job:", error);
    }
  };
  
  
  const handleUpdateApplicationStatus = async (jobId, freelancerName, status) => {
    try {
      console.log(jobId, freelancerName, status);
      const response = await fetch(`http://localhost:4000/employers-Api/employer/updateStatus`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ jobId, freelancerName, status }),
      });
  
      const result = await response.json();
      if (result.message !== "Application status updated successfully.") throw new Error(response.message || "Failed to update status");
  
      setApplications((prevApplications) =>
        prevApplications.map((application) =>
          application.jobId === jobId && application.freelancerName === freelancerName
            ? { ...application, status }
            : application
        )
      );
    } catch (error) {
      console.error("Error updating application status:", error);
    }
  };

  return (
    <div className="dashboard-container">
      <div className="sidebar">
        <h2>Employer Dashboard</h2>
        <ul>
          <li
            className={activeSection === "dashboard" ? "active" : ""}
            onClick={() => setActiveSection("dashboard")}
          >
            Dashboard
          </li>
          <li
            className={activeSection === "jobPostings" ? "active" : ""}
            onClick={() => setActiveSection("jobPostings")}
          >
            Job Postings
          </li>
          <li
            className={activeSection === "notifications" ? "active" : ""}
            onClick={() => setActiveSection("notifications")}
          >
            Notifications
          </li>
          <li
            className={activeSection === "profile" ? "active" : ""}
            onClick={() => setActiveSection("profile")}
          >
            Profile
          </li>
        </ul>
      </div>

      <div className="main-content">
      {activeSection === "dashboard" && (
          <div className="freelancer-profiles">
            <h3>Freelancer Profiles</h3>
            <div className="esearch-bar">
              <input type="text" placeholder="Search freelancers..." value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button>Search</button>
            </div>
            <div className="freelancer-list">
  {filteredFreelancers.map((freelancer, index) => {
    return (
      <div key={index} className="freelancer-card">
        <div className="usericon">
          <FaRegUser size={70} />
        </div>
        <div className="freelancer-card-right">
          <h4>{freelancer.fullName}</h4>
          <p>{freelancer.description}</p>
          <div className="availability-container">
            <span className="availability-dot"></span>
            <p>{freelancer.availability}</p>
          </div>
          <button onClick={() => handleViewProfile(freelancer)}>View Profile</button>
        </div>
      </div>
    );
  })}
</div>
          </div>
        )}
        {selectedFreelancer && (
          <div className="freelancer-profile-modal">
            <div className="modal-content">
              <h3>{selectedFreelancer.fullName}</h3>
              <p><strong>Email:</strong> {selectedFreelancer.email}</p>
              <p><strong>Work Experience:</strong> {selectedFreelancer.workExperience} years</p>
              <p><strong>Skills:</strong> {selectedFreelancer.skills}</p>
              <p><strong>GitHub:</strong> <a href={selectedFreelancer.github} target="_blank" rel="noopener noreferrer">{selectedFreelancer.github}</a></p>
              <p><strong>Past Companies:</strong> {selectedFreelancer.pastCompanies}</p>
              <p><strong>Description:</strong> {selectedFreelancer.description}</p>
              <button onClick={handleCloseProfile}>Close</button>
            </div>
          </div>
        )}

        {activeSection === "jobPostings" && (
          <div className="job-postings">
            <h3>Job Postings</h3>
            <form onSubmit={handleSubmit(handlePostJob)} className="mb-6 space-y-4">
              <div>
                <label className="block font-medium">Company Name:</label>
                <input
                  {...register("companyname", { required: "Company name is required" })}
                  value={formData.companyname}
                  onChange={(e) => setFormData({ ...formData, companyname: e.target.value })}
                  className="border p-2 w-full"
                />
                {errors.companyname && <p className="text-red-500">{errors.companyname.message}</p>}
              </div>

              <div>
                <label className="block font-medium">Job Title:</label>
                <input
                  {...register("jobTitle", { required: "Job title is required" })}
                  value={formData.jobTitle}
                  onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                  className="border p-2 w-full"
                />
                {errors.jobTitle && <p className="text-red-500">{errors.jobTitle.message}</p>}
              </div>

              <div>
                <label className="block font-medium">Status:</label>
                <select
                  {...register("status", { required: "Status is required" })}
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="border p-2 w-full"
                >
                  <option value="Active">Active</option>
                  <option value="Closed">Closed</option>
                </select>
                {errors.status && <p className="text-red-500">{errors.status.message}</p>}
              </div>

              <div>
                <label className="block font-medium">Pay:</label>
                <input
                  type="number"
                  {...register("pay", { required: "Pay is required", min: 1 })}
                  value={formData.pay}
                  onChange={(e) => setFormData({ ...formData, pay: e.target.value })}
                  className="border p-2 w-full"
                />
                {errors.pay && <p className="text-red-500">{errors.pay.message}</p>}
              </div>

              <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
                Post Job
              </button>
            </form>

            <div>
              <h3 className="text-xl font-bold">Your Job Listings</h3>
              {jobPostings.length === 0 ? (
                <p className="text-gray-500">No job postings yet.</p>
              ) : (
                <ul className="mt-4 space-y-2">
                  {jobPostings.map((job) => (
                    <li key={job.id} className="border p-3 rounded shadow">
                      <p><strong>Company:</strong> {job.companyname}</p>
                      <p><strong>Role:</strong> {job.jobTitle}</p>
                      <p><strong>Status:</strong> {job.status}</p>
                      <p><strong>Pay:</strong> {job.pay}</p>
                      <button onClick={() => deleteJob(job._id)} className="bg-red-500 text-white px-3 py-1 rounded">
                        Delete
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
{activeSection === "notifications" && (
  <div className="notifications">
    <h3>Freelancer Applications</h3>
    {applications.length === 0 ? (
      <p>No applications yet.</p>
    ) : (
      applications.map((application) => (
        <div key={`${application.jobId}`} className="application-card">
          <h4>{application.companyName}</h4>
          <p><strong>Job Title:</strong> {application.jobTitle}</p>
          <p><strong>Freelancer Name:</strong> {application.freelancerName}</p>
          <p><strong>Email:</strong> {application.email}</p>
          <p><strong>Skills:</strong> {application.skills}</p>
          <p><strong>Experience:</strong> {application.experience} years</p>
          <p><strong>Rate:</strong> {application.rate}</p>
          <p><strong>Availability:</strong> {application.availability}</p>
          <p><strong>Status:</strong> {application.status}</p>
          <div className="status-actions">
            <button
              onClick={() => handleUpdateApplicationStatus(application.jobId, application.freelancerName, "Accepted")}
              className={application.status === "Accepted" ? "active" : ""}>
              Accept
            </button>
            <button
              onClick={() => handleUpdateApplicationStatus(application.jobId, application.freelancerName, "Rejected")}
              className={application.status === "Rejected" ? "active" : ""}>
              Reject
            </button>
            <button
              onClick={() => handleUpdateApplicationStatus(application.jobId, application.freelancerName, "Pending")}
              className={application.status === "Pending" ? "active" : ""}>
              Pending
            </button>
          </div>
        </div>
      ))
    )}
  </div>
)}


        {activeSection === "profile" && (
          <div className="employer-profile">
            <h3>Employer Profile</h3>
            {isEditing ? (
              <form onSubmit={handleSubmit(onSubmitProfile)} className="profile-form">
                <div className="form-group">
                  <label>Name:</label>
                  <input type="text" {...register("fullName")} />
                </div>
                <div className="form-group">
                  <label>Email:</label>
                  <input type="email" {...register("email")} />
                </div>
                <div className="form-group">
                  <label>Mobile:</label>
                  <input type="text" {...register("mobileNumber")} />
                </div>
                <div className="form-group">
                  <label>Company:</label>
                  <input type="text" {...register("companyname")} />
                </div>
                <div className="form-group">
                  <label>Location:</label>
                  <input type="text" {...register("location")} />
                </div>
               <div className="d-flex editbuttn">
               <button type="submit">Save</button>
               <button type="button" onClick={() => { reset(); setIsEditing(false); }}>Cancel</button>
               </div>
              </form>
            ) : (
              <div className="profile-details">
                <p><strong>Name:</strong> {currentEmployer?.fullName}</p>
                <p><strong>Email:</strong> {currentEmployer?.email}</p>
                <p><strong>Mobile:</strong> {currentEmployer?.mobileNumber}</p>
                <p><strong>Company:</strong> {currentEmployer?.companyname || "Not provided"}</p>
                <p><strong>Location:</strong> {currentEmployer?.location || "Not provided"}</p>
                <button onClick={() => setIsEditing(true)}>Edit Profile</button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default EmployerDashboard;