const exp = require("express");
const freelancerApp = exp.Router();
const bcryptjs=require('bcryptjs')
const jwt=require('jsonwebtoken')
const tokenVerify=require('../middlewares/tokenVerify')
const expressAsyncHandler=require('express-async-handler')
require('dotenv').config()
freelancerApp.use(exp.json())

// Define routes
freelancerApp.get("/", (req, res) => {
  res.send({ message: "User API working!" });
});

//register freelancer
freelancerApp.post('/register', expressAsyncHandler(async (req, res) => {
  const freelancerCollection = req.app.get("freelancerCollection");
  let newUser = req.body;
  // Validate required fields
  if (!newUser.fullName || !newUser.email || !newUser.mobileNumber || !newUser.password || !newUser.userType) {
      return res.status(400).send({ message: "All fields are required" });
  }
  // Check if user already exists
  let existingUser = await freelancerCollection.findOne({
      $or: [{ fullName: newUser.fullName }]
  });
  if (existingUser) {
      return res.status(400).send({ message: "User already exists" });
  }
  // Hash password before saving
  newUser.password = await bcryptjs.hash(newUser.password, 7);
  // Save user to database
  await freelancerCollection.insertOne(newUser);
  res.status(201).send({ message: "User registered successfully" });
}));

//freelancer login
freelancerApp.post('/login',expressAsyncHandler(async(req,res)=>{
  //get freelancersCollection obj
  const freelancerCollection=req.app.get('freelancerCollection')
  //get new freelancerCredential from client
  const freelancerCred=req.body;
  //verify email
  let dbUserName=await freelancerCollection.findOne({fullName:freelancerCred.username})
  console.log(dbUserName);
  //if user not existed
  if(dbUserName==null){
      res.send({message:"Invalid email"})
  }
  else{
     let result = await bcryptjs.compare(freelancerCred.password,dbUserName.password)
     if(result===false)
     {
      res.send({message:"Invalid password"})
  }
  else{
      //create jwt token
      let signedToken=jwt.sign({fullName:freelancerCred.fullName}, process.env.SECRET_KEY ,{expiresIn:'15m'})
      //send res
      res.send({message:"login success",token:signedToken,user:dbUserName})
  }
  }
}));

//Upload profile(resume)

freelancerApp.put('/freelancer/:fullName/uploadProfile', expressAsyncHandler(async (req, res) => {
  // Get freelancerCollection object
  const freelancerCollection = req.app.get('freelancerCollection');

  // Get fullName from params and profile details from request body
  const { fullName } = req.params;
  const profileDetails = req.body;

  try {
      // Find and update freelancer
      const updatedFreelancer = await freelancerCollection.findOneAndUpdate(
          { fullName }, 
          { $set: { profileList: profileDetails } }, // Store profile as an object
          { returnDocument: "after" } // Returns updated document
      );

      // If freelancer not found
      if (!updatedFreelancer) {
          return res.status(404).json({ message: "Freelancer not found" });
      }

      console.log(updatedFreelancer)
      // Send response
      res.status(200).json({ message: "Profile uploaded successfully!", payload: updatedFreelancer.profileList });

  } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
}));



//update profile(resume)
const { ObjectId } = require('mongodb');
freelancerApp.put('/freelancer/:id/updateProfile', expressAsyncHandler(async (req, res) => {
  try {
      const freelancerCollection = req.app.get('freelancerCollection');

      // Convert string ID to ObjectId
      const idOfUrl = new ObjectId(req.params.id);

      // Get updated profile details
      const modifiedProfileList = req.body;
      console.log("Modified Profile: ", modifiedProfileList);

      // Update the profile directly (since profileList is an object, not an array)
      const updateResult = await freelancerCollection.updateOne(
          { _id: idOfUrl },
          { $set: { profileList: modifiedProfileList } }
      );

      if (updateResult.matchedCount === 0) {
          return res.status(404).json({ message: "Freelancer not found or no profile to update" });
      }

      res.json({ message: "Profile updated successfully", payload: updateResult });

  } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ message: "Internal Server Error", errorMessage: error.message });
  }
}));


//edit profile-up (profile)
freelancerApp.put('/freelancer/:id/editProfile', expressAsyncHandler(async (req, res) => {
    const freelancerCollection = req.app.get('freelancerCollection');
    const { id } = req.params;  // Get ID from URL
    const updateFields = req.body; // Get fields to update
  
    try {
        // Find the freelancer by ID
        const freelancer = await freelancerCollection.findOne({ _id: new ObjectId(id) });
  
        if (!freelancer) {
            return res.status(404).json({ message: `No freelancer found with ID: ${id}` });
        }
        
        // Update the freelancer's profile
        const updatedDetails = await freelancerCollection.updateOne(
            { _id: new ObjectId(id) },
            { $set: updateFields }
        );  
        console.log("currentfreelancer",updatedDetails)
        res.status(200).json({ message: "Profile updated successfully!",payload:updatedDetails });
  
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
  }));
  

//applied profile (application)
freelancerApp.put('/freelancer/:fullName/application/:id', expressAsyncHandler(async (req, res) => {
  const freelancerCollection = req.app.get('freelancerCollection');
  const employerCollection = req.app.get('employerCollection');

  const { fullName, id } = req.params;
  const applicationDetails = req.body;

  try {
      // Validate Job ID format
      if (!ObjectId.isValid(id)) {
          return res.status(400).json({ message: "Invalid job ID format." });
      }
      const jobId = new ObjectId(id);

      // Find employer with the job in jobList
      const employer = await employerCollection.findOne({ "jobList._id": jobId });

      if (!employer) {
          return res.status(404).json({ message: `No employer found with job ID: ${id}` });
      }

      // Locate job inside employer's jobList
      const jobIndex = employer.jobList.findIndex(job => job._id.equals(jobId));

      if (jobIndex === -1) {
          return res.status(404).json({ message: `Job with ID ${id} not found.` });
      }

      const job = employer.jobList[jobIndex];

      // Ensure applications array exists
      if (!job.applications) {
          job.applications = [];
      }

      // Check if the freelancer has already applied
      const existingApplication = job.applications.find(app => app.fullName === fullName);

      if (existingApplication) {
          return res.status(400).json({ message: "Freelancer has already applied for this job." });
      }
      const freelancer = await freelancerCollection.findOne({ fullName });

      // Add status as 'Pending' and timestamp
      const newApplication = {
          ...applicationDetails,
          fullName,
          status: "Pending",
          jobId: jobId,
          freelancerId: freelancer._id
      };

      // Add new application to employer's job applications
      job.applications.push(newApplication);

      // Update employer document
      await employerCollection.updateOne(
          { "jobList._id": jobId },
          { $set: { [`jobList.${jobIndex}.applications`]: job.applications } }
      );

      // ✅ **Now Add Job Details to Freelancer Account**

      if (!freelancer) {
          return res.status(404).json({ message: `No freelancer found with name: ${fullName}` });
      }

      // Ensure appliedJob array exists
      if (!freelancer.appliedJob) {
          freelancer.appliedJob = [];
      }

      // Add job details with status "Pending"
      const appliedJob = {
          jobId: job._id,
          jobTitle: job.jobTitle,
          companyName: job.companyname,
          status: "Pending", // Default status
      };

      freelancer.appliedJob.push(appliedJob);

      // Update freelancer document
      await freelancerCollection.updateOne(
          { fullName },
          { $set: { appliedJob: freelancer.appliedJob } }
      );

      res.status(200).json({ message: "Application submitted successfully and recorded in freelancer's account!" });

  } catch (error) {
      console.error("Error:", error);
      res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
}));


//delete profile
freelancerApp.delete('/freelancer/:fullName/deleteProfile', expressAsyncHandler(async (req, res) => {
    const freelancerCollection = req.app.get('freelancerCollection');
    const { fullName } = req.params;

    try {
        // Find the freelancer by full name
        const freelancer = await freelancerCollection.findOne({ fullName });

        if (!freelancer) {
            return res.status(404).json({ message: `No freelancer found with name: ${fullName}` });
        }

        // Remove the profileList field
        await freelancerCollection.updateOne(
            { fullName },
            { $unset: { profileList: "" } }  // Removes profileList field
        );

        res.status(200).json({ message: "Profile list deleted successfully!" });

    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
}));

//get all profiles
freelancerApp.get('/profiles', expressAsyncHandler(async (req, res) => {
  const freelancerCollection = req.app.get('freelancerCollection');

  try {
      // Fetch all freelancers from the collection
      const freelancers = await freelancerCollection.find({}, { projection: { profileList: 1, _id: 0 } }).toArray();
const profileLists = freelancers.map(freelancer => freelancer.profileList);
console.log("Extracted profileLists:", profileLists);


      if (freelancers.length === 0) {
          return res.status(404).json({ message: "No freelancers found." });
      }

      // Send response with profiles inside 'payload'
      res.status(200).json({
          message: "Freelancer profiles fetched successfully!",
          payload: freelancers
      });

  } catch (error) {
      console.error("Error:", error);
      res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
}));

//get profileLists of all the users
freelancerApp.get("/profileList", expressAsyncHandler(async (req, res) => {
    try {
        const freelancerCollection = req.app.get('freelancerCollection');
        
        // Fetch all freelancers
        const freelancers = await freelancerCollection.find({}).toArray();
        console.log("Fetched freelancers:", freelancers); // Log fetched data

        if (!freelancers || freelancers.length === 0) {
            return res.status(404).json({ message: "No freelancers found in database." });
        }

        let profileLists = [];
        freelancers.forEach(freelancer => {
            console.log(`Processing freelancer: ${freelancer.name}`, freelancer.profileList);
            if (freelancer.profileList && Array.isArray(freelancer.profileList)) {
                profileLists.push(...freelancer.profileList);
            }
        });

        console.log("Extracted profileLists:", profileLists); // Log extracted data

        if (profileLists.length === 0) {
            return res.status(404).json({ message: "No profile lists found." });
        }

        res.status(200).json({ payload: profileLists });
    } catch (error) {
        console.error("Error fetching freelancer profiles:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}));



// Export the router
module.exports = freelancerApp;