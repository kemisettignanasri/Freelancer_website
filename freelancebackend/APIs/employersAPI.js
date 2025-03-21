const exp = require("express");
const employerApp = exp.Router();
const bcryptjs=require('bcryptjs')
const jwt=require('jsonwebtoken')
const tokenVerify=require('../middlewares/tokenVerify')
const expressAsyncHandler=require('express-async-handler')
require('dotenv').config()
employerApp.use(exp.json())
const { ObjectId } = require('mongodb');

// Define routes
employerApp.get("/", (req, res) => {
  res.send({ message: "User API working!" });
});

//register
employerApp.post('/register', expressAsyncHandler(async (req, res) => {
  const employerCollection = req.app.get("employerCollection");
  let newUser = req.body;
  // Validate required fields
  if (!newUser.fullName || !newUser.email || !newUser.mobileNumber || !newUser.password || !newUser.userType) {
      return res.status(400).send({ message: "All fields are required" });
  }
  // Check if user already exists
  let existingUser = await employerCollection.findOne({
      $or: [{ fullName: newUser.fullName }]
  });
  if (existingUser) {
      return res.status(400).send({ message: "User already exists" });
  }
  // Hash password before saving
  newUser.password = await bcryptjs.hash(newUser.password, 7);
  // Save user to database
  await employerCollection.insertOne(newUser);
  res.status(201).send({ message: "User registered successfully" });
}));

//employer login
employerApp.post('/login',expressAsyncHandler(async(req,res)=>{
  //get employersCollection obj
  const employerCollection=req.app.get('employerCollection')
  //get new employerCredential from client
  const employerCred=req.body;

  //verify email
  let dbUserName=await employerCollection.findOne({fullName:employerCred.username})
  //if user not existed
  if(dbUserName==null){
      res.send({message:"Invalid fullname"})
  }
  else{
     let result = await bcryptjs.compare(employerCred.password,dbUserName.password)
     if(result===false)
     {
      res.send({message:"Invalid password"})
  }
  else{
      //create jwt token
      let signedToken=jwt.sign({fullName:employerCred.fullName}, process.env.SECRET_KEY ,{expiresIn:'15m'})
      //send res
      res.send({message:"login success",token:signedToken,employer:dbUserName})
  }
  }
}));

 //employer edit profile
 employerApp.put('/employer/:id/editProfile', tokenVerify, expressAsyncHandler(async (req, res) => {
     const employerCollection = req.app.get('employerCollection');
     const { id } = req.params;
     const { fullName, email, mobileNumber, companyname, location } = req.body;
 
     try {
         const employer = await employerCollection.findOne({ _id: new ObjectId(id) });
 
         if (!employer) {
             return res.status(404).json({ message: `No employer found with ID: ${id}` });
         }
 
         const updateResult = await employerCollection.findOneAndUpdate(
             { _id: new ObjectId(id) },
             { $set: { fullName, email, mobileNumber, companyname, location } },
             { returnDocument: "after" } // 🔹 Return the updated document
         );
 
         res.status(200).json({
             message: "Profile updated successfully!",
             updatedEmployer: updateResult, // 🔹 Send updated employer data
         });
 
     } catch (error) {
         console.error("Error updating profile:", error);
         res.status(500).json({ message: "Internal Server Error", error: error.message });
     }
 }));
 



//put jobList
employerApp.put('/employer/:fullName/joblisting', expressAsyncHandler(async (req, res) => {
    const employerCollection = req.app.get('employerCollection');
    const fullName = req.params.fullName;
    let jobDetails = req.body;

    // Find the employer by fullName
    let employer = await employerCollection.findOne({ fullName: fullName });

    // If employer not found, send a 404 response
    if (!employer) {
        return res.status(404).send({ message: "Employer not found" });
    }

    // Initialize jobList array if it does not exist
    if (!employer.jobList) {
        employer.jobList = [];
    }

    // Assign a unique _id to the new job
    jobDetails._id = new ObjectId();  

    // Add new job details to the jobList array
    employer.jobList.push(jobDetails);

    // Update the employer document with the new job details
    await employerCollection.updateOne(
        { fullName: fullName },
        { $set: { jobList: employer.jobList } }
    );

    // Send response
    res.send({ message: "Job added", payload: employer.jobList });
}));

// DELETE Job Posting
employerApp.delete('/employer/:fullName/joblisting/:jobId', expressAsyncHandler(async (req, res) => {
    const employerCollection = req.app.get('employerCollection');
    const fullName = req.params.fullName;
    const jobId = req.params.jobId;

    // Find the employer by fullName
    let employer = await employerCollection.findOne({ fullName: fullName });

    // If employer not found, send a 404 response
    if (!employer) {
        return res.status(404).send({ message: "Employer not found" });
    }

    // Filter out the job that needs to be deleted
    const updatedJobList = employer.jobList.filter(job => job._id.toString() !== jobId);

    // Update the employer document with the filtered job list
    await employerCollection.updateOne(
        { fullName: fullName },
        { $set: { jobList: updatedJobList } }
    );

    // Send response
    res.send({ message: "Job deleted successfully", payload: updatedJobList });
}));

//get JobListing
employerApp.get('/employer/:id/getJobListing', expressAsyncHandler(async (req, res) => {
    const employerCollection = req.app.get('employerCollection');
    const { id } = req.params;

    try {
        // Convert ID to ObjectId
        if (!ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid employer ID format." });
        }
        const employerId = new ObjectId(id);

        // Fetch employer by ID
        const employer = await employerCollection.findOne({ _id: employerId });

        if (!employer) {
            return res.status(404).json({ message: "Employer not found." });
        }

        // Send jobList array inside payload
        res.status(200).json({
            message: "Job listings fetched successfully!",
            payload: employer.jobList || []  // Ensure an empty array if no jobs exist
        });

    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
}));
//joblisting
employerApp.get('/employers/getAllJobListings', expressAsyncHandler(async (req, res) => {
    const employerCollection = req.app.get('employerCollection');

    try {
        // Fetch all employers and their job listings
        const employers = await employerCollection.find({}, { jobList: 1, fullName: 1, companyname: 1, location: 1 }).toArray();

        // Extract job listings from all employers
        let allJobListings = [];
        employers.forEach(employer => {
            if (employer.jobList && employer.jobList.length > 0) {
                employer.jobList.forEach(job => {
                    allJobListings.push({
                        employerName: employer.fullName,
                        companyName: employer.companyname,
                        location: employer.location,
                        ...job  // Spread job details
                    });
                });
            }
        });

        res.status(200).json({
            message: "All job listings fetched successfully!",
            payload: allJobListings
        });

    } catch (error) {
        console.error("Error fetching all job listings:", error);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
}));

employerApp.get('/employer/:fullName/applications', expressAsyncHandler(async (req, res) => {
    const employerCollection = req.app.get('employerCollection');
    const { fullName } = req.params;

    try {
        console.log(`Fetching applications for employer: ${fullName}`);

        // Find employer by full name
        const employer = await employerCollection.findOne({ fullName });

        if (!employer) {
            console.log("Employer not found");
            return res.status(404).json({ message: "Employer not found" });
        }

        console.log("Employer found:", employer);

        if (!employer.jobList || !Array.isArray(employer.jobList)) {
            console.log("No job list found for employer");
            return res.status(404).json({ message: "No job listings found" });
        }
        const applications = employer.jobList.flatMap(job =>
            (job.applications || []).map(app => ({
                jobId: job._id,
                jobTitle: job.jobTitle,
                companyName: job.companyname,
                freelancerName: app.fullName,
                email: app.email,
                skills: app.skills,
                experience: app.experience,
                rate: app.rate,
                availability: app.availability,
                status: app.status
            }))
        );

        res.status(200).json({ payload: applications });

    } catch (error) {
        console.error("Error fetching applications:", error);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
}));



//statusUpdate
employerApp.put('/employer/updateStatus', expressAsyncHandler(async (req, res) => {
    const { jobId, freelancerName, status } = req.body;
    const jobid = new ObjectId(jobId);
    
    try {
        const employerCollection = req.app.get('employerCollection');
        const freelancerCollection = req.app.get('freelancerCollection');

        
        // Update the application status in employerCollection
        const employerUpdateResult = await employerCollection.updateOne(
            { "jobList._id": jobid, "jobList.applications.fullName": freelancerName },
            { $set: { "jobList.$[job].applications.$[app].status": status } },
            { arrayFilters: [{ "job._id": jobid }, { "app.fullName": freelancerName }] }
        );
        
        // Update the application status in freelancerCollection
        const freelancerUpdateResult = await freelancerCollection.updateOne(
            { "appliedJob.jobId": jobid, "fullName": freelancerName },
            { $set: { "appliedJob.$.status": status } }
        );
        
        if (employerUpdateResult.modifiedCount === 0 && freelancerUpdateResult.modifiedCount === 0) {
            return res.status(404).json({ message: "Application not found or status unchanged." });
        }
        
        res.status(200).json({ message: "Application status updated successfully." });
    } catch (error) {
        console.error("Error updating application status:", error);
    }
}));

//get all user profiles
employerApp.get('/profiles', expressAsyncHandler(async (req, res) => {
  const employerCollection = req.app.get('employerCollection');

  try {
      // Fetch all employers from the collection
      const employers = await employerCollection.find().toArray();

      if (employers.length === 0) {
          return res.status(404).json({ message: "No employers found." });
      }

      // Send response with profiles inside 'payload'
      res.status(200).json({
          message: "Employer profiles fetched successfully!",
          payload: employers
      });

  } catch (error) {
      console.error("Error:", error);
      res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
}));


// Export the router
module.exports = employerApp;