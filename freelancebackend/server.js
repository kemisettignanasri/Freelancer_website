//create http server
    //import and use express module
    const exp=require('express');
    const app=exp();

    const cors=require('cors');
    app.use(cors({
        origin:'http://localhost:5173'
    }))

    require('dotenv').config()  //process.env.SECRET__KEY
    //import MongoClient
    const {MongoClient}=require('mongodb');
    //Create MongoClient object
    let mClient=new MongoClient(process.env.DB_URL)

    //connect to mongodb server
    mClient.connect()
    .then((connectionObj)=>{
        

        //connect to a database
        const flhdb=connectionObj.db('FreelanceHubData')
        //connect to a collection
        const freelancerCollection=flhdb.collection('freelancerdata')
        const employerCollection=flhdb.collection('employerdata')
      
        //share collection obj to APIS
        app.set('freelancerCollection',freelancerCollection)
        app.set('employerCollection',employerCollection)

        console.log("DB connection success")
    //assign port number to http server of express app
    app.listen(process.env.PORT,()=>console.log("http server started on port 4000"))
    })
    .catch(err=>console.log("Error in DB connection",err));
    
    //import userApp express object
    const freelancerApp=require('./APIs/freelancersAPI')
    const employerApp=require('./APIs/employersAPI')

    //if path starts with /user-api, forward req to userApp
    app.use('/freelancers-Api',freelancerApp)
    //if path starts with /user-api, forward req to userApp
    app.use('/employers-Api',employerApp)

    //handling invalid path
    app.use('*',(req,res,next)=>{
        res.send({message:'Invalid path'})
    })

    //error handling middleware
    app.use((err,req,res,next)=>{
        res.send({message:"error occured",errorMessage:err.message})
  })