import React, { useState, useEffect, useContext } from 'react';
import './FreelancerDashboard.css';
import { useForm } from 'react-hook-form';
import { FaUserCircle } from "react-icons/fa";
import { employerLoginContext } from '../../contexts/employerLoginContext';
import {freelancerLoginContext} from '../../contexts/freelancerLoginContext';

function FreelancerDashboard() {
  const [jobs, setJobs] = useState([]);
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [selectedOption, setSelectedOption] = useState('dashboard');
  const [showModal, setShowModal] = useState(false);
  const { setValue ,formState: {errors}} = useForm();
  const [showEditModal, setShowEditModal] = useState(false);  
  const {currentFreelancer,setCurrentFreelancer} = useContext(freelancerLoginContext)
  const [isEditing,setIsEditing] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [uploadedProfile, setUploadedProfile] = useState(null);
const [showApplyModal, setShowApplyModal] = useState(false); 
  const { register, handleSubmit, reset } = useForm({
    defaultValues: currentFreelancer || {} 
  });
useEffect(() => {
  if (selectedOption === "profile"  && currentFreelancer) {
    setValue("fullName", currentFreelancer?.fullName || "");
    setValue("email", currentFreelancer?.email || "");
    setValue("mobileNumber", currentFreelancer?.mobileNumber || "");
  }
}, [selectedOption, currentFreelancer, setValue]);
console.log("current",currentFreelancer)

const onSubmitProfile = async (data) => {
  if (!currentFreelancer?._id) {
   
    console.error("Freelancer ID is missing");
    return;
  }
  try {
    const response = await fetch(`http://localhost:4000/freelancers-Api/freelancer/${currentFreelancer._id}/editProfile`, { 
      method: "PUT",
      headers: { "Content-Type": "application/json",Authorization: `Bearer ${sessionStorage.getItem('token')}` },
      body: JSON.stringify(data),
    });

    const res=await response.json()

    if (res.message!="Profile updated successfully!") {
      throw new Error("Failed to update freelancer profile");
    }

    console.log("Updated profile:",res.payload)
    setCurrentFreelancer(res.payload);
    setIsEditing(false);
    setShowEditModal(false);
  } catch (error) {
    console.error("Error updating profile:", error);
  }
};

  const { jobListing } = useContext(employerLoginContext);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredJobs = Array.isArray(jobListing)
  ? jobListing.filter(job =>
      (job.jobTitle?.toLowerCase() ?? "").includes(searchQuery?.toLowerCase() ?? "") ||
      (job.companyname?.toLowerCase() ?? "").includes(searchQuery?.toLowerCase() ?? "") ||
      (job.status?.toLowerCase() ?? "").includes(searchQuery?.toLowerCase() ?? "")
    )
  : [];

  const [freelancerdetails,setfreelancerdetails]=useState([])
  const [showAlreadyAppliedModal, setShowAlreadyAppliedModal] = useState(false);

  const handleApplyClick = (jobId) => {
   
    const alreadyApplied = appliedJobs.some(job => job.jobId === jobId);
  
    if (alreadyApplied) {
      setShowAlreadyAppliedModal(true); 
      return;
    }
  
    console.log(jobId);
    setSelectedJobId(jobId);
   
    reset({
      fullName: currentFreelancer.fullName,
      email: currentFreelancer.email,
      phone: currentFreelancer.mobileNumber,
      skills: "",
      portfolioUrl: "",
      experience: "",
      rate: "",
      resumeUrl: "",
      availability: "",
    });
  
    setShowApplyModal(true);
  };

  const handleProposalSubmit = async (data) => {
    try {
      const proposalData = {
        jobId: selectedJobId,
        freelancerId: currentFreelancer._id,
        status: 'Pending',
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        skills: data.skills,
        portfolioUrl: data.portfolioUrl,
        experience: data.experience,
        rate: data.rate,
        resumeUrl: data.resumeUrl,
        availability: data.availability,
      };
  
      //  Fetch employer data
      const response = await fetch(`http://localhost:4000/freelancers-Api/freelancer/${proposalData.fullName}/application/${proposalData.jobId}`,{
        method:"PUT",
        headers: { "Content-Type": "application/json" },
      body: JSON.stringify(proposalData)
      }
      )
      const res=await response.json()
      if(res.message==="Application submitted successfully and recorded in freelancer's account!"){
        const job = jobListing.find(job => job._id === selectedJobId);
        if (job) {
          setAppliedJobs(prevAppliedJobs => [
            ...prevAppliedJobs,
            {
              jobId: selectedJobId,
              companyName: job.companyname,
              jobTitle: job.jobTitle,
              status: 'Pending',
            },
          ]);
        }
        setShowApplyModal(false)
      }
    }catch(error){
      console.log(error)
    }
  };
  //applied
  useEffect(() => {
    const fetchAppliedJobs = async () => {
      try {
        const response = await fetch(`http://localhost:4000/freelancers-Api/freelancer/${currentFreelancer.fullName}/appliedJobs`);
        const data = await response.json();
  
        if (data.appliedJobs) {
          setAppliedJobs(data.appliedJobs);
        }
      } catch (error) {
        console.error('Error fetching applied jobs:', error);
      }
    };
  
    if (currentFreelancer?.fullName) {
      fetchAppliedJobs();
    }
  }, [currentFreelancer]);
  

useEffect(()=>{
  setUploadedProfile(currentFreelancer?.profileList ? currentFreelancer.profileList : null);
},[currentFreelancer]);

async function details(freelancerData) {
  try {
         const profileList = {
          fullName: freelancerData.fullName,
          email: freelancerData.email,
          workExperience: freelancerData.workExperience,
          skills: freelancerData.skills,
          github: freelancerData.github,
          pastCompanies: freelancerData.pastCompanies,
          description: freelancerData.description,
          availability: freelancerData.availability
      };
      const res = await fetch(`http://localhost:4000/freelancers-Api/freelancer/${freelancerData.fullName}/uploadProfile`, {
          method: "PUT",
          headers: {
              "Content-Type": "application/json",
          },
          body: JSON.stringify(profileList), // Send profile data directly
      });

      // Handle response
      if (!res.ok) {
          throw new Error(`Failed to update profile: ${res.statusText}`);
      }

      const updatedData = await res.json();

      // Update UI state with new profile data
      setUploadedProfile(updatedData.payload);
      console.log("up",uploadedProfile);
      setShowModal(false);
      setShowEditModal(false);
      reset();

  } catch (error) {
      console.error("Error updating freelancer profile:", error);
  }
}

  
  
  
  
  const deleteProfile = async () => {
    try {
      let res = await fetch(`http://localhost:4000/freelancers-Api/freelancer/${currentFreelancer._id}/deleteProfile`,{
        method:"DELETE"
      });
      let data = await res.json();
      if(data.message==="Profile list deleted successfully!"){
        setUploadedProfile(null);
        setfreelancerdetails([]);
      }
    } catch (error) {
      console.error("Error deleting freelancer profile:", error);
    }
  };
  

  const applyToJob = jobId => {
    const job = jobs.find(job => job.id === jobId);
    if (job) {
      setAppliedJobs([...appliedJobs, { ...job, status: 'Waiting for Response' }]);
    }
  };

  return (
    <div className="dashboard">
      <div className="sidebar">
        <ul>
          <li className={selectedOption === 'dashboard' ? 'active' : ''} onClick={() => setSelectedOption('dashboard')}>Dashboard</li>
          <li className={selectedOption === 'profile' ? 'active' : ''} onClick={() => setSelectedOption('profile')}>Profile</li>
          <li className={selectedOption === 'applied-jobs' ? 'active' : ''} onClick={() => setSelectedOption('applied-jobs')}>Applied Jobs</li>
          {/* {userProfile.role === 'Employer' && (
            <li className={selectedOption === 'create-job' ? 'active' : ''} onClick={() => setSelectedOption('create-job')}>Create Job</li>
          )} */}
        </ul>
      </div>
      <div className="main-content">
      {selectedOption === 'dashboard' && (
  <section className="job-listings">
    <h2>Job Listings</h2>
    <div className="search-container">
      <input
        type="text"
        placeholder="Search jobs by title, company, or status..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="search-input"
      />
    </div>
    <div className="joblist">
      {filteredJobs.length === 0 ? (
        <p>No jobs found matching your search criteria.</p>
      ) : (
        filteredJobs.map(job => (
          <div key={job.id} className="job-card">
            <h3>Role: {job.jobTitle}</h3>
            <p className='fs-5 fst-normal'>Company: {job.companyname}</p>
            <p className='fs-5 fst-normal'>Status: {job.status}</p>
            <p className='fs-5 fst-normal'>Pay: {job.pay}</p>
            <button onClick={() => handleApplyClick(job._id)}>Apply Now</button>
          </div>
        ))
      )}
    </div>
  </section>
)}
{showAlreadyAppliedModal && (
  <div className="modal-overlay">
    <div className="modal-content">
      <h2>Already Applied</h2>
      <p>You have already applied for this job. Thank you!</p>
      <button onClick={() => setShowAlreadyAppliedModal(false)}>Close</button>
    </div>
  </div>
)}

    {selectedOption === 'profile' && (
      
      <section className="profile ">
        <h2>User Profile</h2>
        <div className="basic border rounded bg-white">
      <div className='usericon'> <FaUserCircle size={140}/> </div>
      {isEditing? (
        <form onSubmit={handleSubmit(onSubmitProfile)} className="space-y-4">
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

        <div className="editb">
          <button type="button"onClick={()=>{reset(); setIsEditing(false);}} className="editbtn">Cancel</button>
          <button type="submit"className="editbtn">Save Changes</button>
        </div>
      </form>
      ):(
        <div className="flex-grow ">
      
        <p><strong>Name:</strong> {currentFreelancer?.fullName}</p>
        <p><strong>Email:</strong> {currentFreelancer?.email}</p>
        <p><strong>Phone:</strong> {currentFreelancer?.mobileNumber}</p>
        <button onClick={()=>setIsEditing(true)} className="editbt">Edit Profile</button>
      </div>
      )}

      {/* Edit Profile Modal */}
      
    </div>
    <div className="upload border rounded">
              {uploadedProfile ? (
                <div className="uploaded-details border rounded p-4">
                  <h3>Uploaded Profile Details</h3>
                  <p><strong>Name:</strong> {uploadedProfile.fullName}</p>
                  <p><strong>Email:</strong> {uploadedProfile.email}</p>
                  <p><strong>Work Experience:</strong> {uploadedProfile.workExperience} years</p>
                  <p><strong>Skills:</strong> {uploadedProfile.skills}</p>
                  <p><strong>GitHub:</strong> <a href={uploadedProfile.github} target="_blank" rel="noopener noreferrer">{uploadedProfile.github}</a></p>
                  <p><strong>Past Companies:</strong> {uploadedProfile.pastCompanies}</p>
                  <p><strong>Description:</strong> {uploadedProfile.description}</p>
                  <p><strong>Availability:</strong> {uploadedProfile.availability}</p>
                  <div className="action d-flex">
                    <button onClick={() => setShowModal(true)} className="editbtn">Edit</button>
                    <button onClick={deleteProfile} className="deletebtn">Delete</button>

                  </div>
                </div>
              ) : (
                <div className="uploadp">
                  <button onClick={() => setShowModal(true)} className="uploadprofile">Upload Your Profile +</button>
                </div>
              )}
      {showModal && (
                <div className="uploadmodal">
                  <div className="upload-details">
                    <h2>Upload Your Profile</h2>
                    <form onSubmit={handleSubmit(details)} className="space-y-4">
                      <input
                        {...register("name")}
                        defaultValue={uploadedProfile ? uploadedProfile.name : ''}
                        className="w-full p-2 border rounded"
                        placeholder="Name"
                      />
                      <input
                        {...register("email")}
                        defaultValue={uploadedProfile ? uploadedProfile.email : ''}
                        className="w-full p-2 border rounded"
                        placeholder="Email"
                      />
                      <input
                        {...register("workExperience")}
                        defaultValue={uploadedProfile ? uploadedProfile.workExperience : ''}
                        className="w-full p-2 border rounded"
                        placeholder="Work Experience (Years)"
                        type="number"
                      />
                      <input
                        {...register("skills")}
                        defaultValue={uploadedProfile ? uploadedProfile.skills : ''}
                        className="w-full p-2 border rounded"
                        placeholder="Skills (Comma separated)"
                      />
                      <input
                        {...register("github")}
                        defaultValue={uploadedProfile ? uploadedProfile.github : ''}
                        className="w-full p-2 border rounded"
                        placeholder="GitHub Profile Link"
                      />
                      <input
                        {...register("pastCompanies")}
                        defaultValue={uploadedProfile ? uploadedProfile.pastCompanies : ''}
                        className="w-full p-2 border rounded"
                        placeholder="Past Worked Companies"
                      />
                      <textarea
                        {...register("description")}
                        defaultValue={uploadedProfile ? uploadedProfile.description : ''}
                        className="w-full p-2 border rounded"
                        placeholder="Describe yourself"
                      />
                      <div className="form-group">
                      <label>Availability</label>
                      <select
                      {...register("availability", { required: true })}
                      defaultValue={uploadedProfile ? uploadedProfile.availability : ''}
                      className="w-full p-2 border rounded">
                      <option value="full-time">Full-Time</option>
                      <option value="part-time">Part-Time</option>
                      <option value="project-based">Project-Based</option>
                      </select>
                      {errors.availability && <span>This field is required</span>}
                      </div>
                      <div className="editb">
                        <button
                          type="button"
                          onClick={() => setShowModal(false)}
                          className="editbtn">Cancel</button>
                        <button type="submit" className="editbtn">Submit</button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          </section>
        )}
      {selectedOption === 'applied-jobs' && (
  <section className="applied-jobs">
    <h2>Applied Jobs</h2>
    {appliedJobs.length === 0 ? (
      <p>You haven't applied to any jobs yet.</p>
    ) : (
      <table className="applied-jobs-table">
        <thead>
          <tr>
            <th>Company Name</th>
            <th>Role</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {appliedJobs.map((job, index) => (
            <tr key={index}>
              <td>{job.companyName}</td> 
              <td>{job.jobTitle}</td>
              <td>{job.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    )}
  </section>
)}

        
      </div>
      {showApplyModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Apply for Job</h2>
            <form onSubmit={handleSubmit(handleProposalSubmit)}>
              <div className="form-group">
                <label>Full Name</label>
                <input {...register("fullName", { required: true })} />
                {errors.fullName && <span>This field is required</span>}
              </div>
              <div className="form-group">
                <label>Email</label>
                <input {...register("email", { required: true })} />
                {errors.email && <span>This field is required</span>}
              </div>
              <div className="form-group">
          <label>Phone Number</label>
          <input type="tel" {...register("phone", { required: true })} />
          {errors.phone && <span>This field is required</span>}
        </div>

        <div className="form-group">
          <label>Skills</label>
          <input {...register("skills", { required: true })} />
          {errors.skills && <span>This field is required</span>}
        </div>

        <div className="form-group">
          <label>Portfolio (URL)</label>
          <input type="url" {...register("portfolioUrl", { required: false })} />
        </div>

        <div className="form-group">
          <label>Work Experience (Years)</label>
          <input type="number" {...register("experience", { required: true })} />
          {errors.experience && <span>This field is required</span>}
        </div>

        <div className="form-group">
          <label>Expected Rate</label>
          <input type="number" {...register("rate", { required: true })} />
          {errors.rate && <span>This field is required</span>}
        </div>


        <div className="form-group">
          <label>Resume (URL)</label>
          <input type="url" {...register("resumeUrl", { required: true })} />
          {errors.resumeUrl && <span>This field is required</span>}
        </div>

        <div className="form-group">
          <label>Availability</label>
          <select {...register("availability", { required: true })}>
            <option value="full-time">Full-Time</option>
            <option value="part-time">Part-Time</option>
            <option value="project-based">Project-Based</option>
          </select>
          {errors.availability && <span>This field is required</span>}
        </div>

        <button type="submit" >Submit Proposal</button>

              <button type="button" onClick={() => setShowApplyModal(false)}>Close</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default FreelancerDashboard;