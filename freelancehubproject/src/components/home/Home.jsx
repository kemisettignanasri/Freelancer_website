import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import './Home.css';

function Home() {
  const [currentStep, setCurrentStep] = useState(0);

  const employerSteps = [
    {
      text: 'Sign up & post a job.',
      image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80', // Image of someone posting a job online
    },
    {
      text: 'Get proposals from skilled freelancers.',
      image: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80', // Image of freelancers working
    },
    {
      text: 'Hire, collaborate, and pay securely.',
      image: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80', // Image of collaboration and payment
    },
  ];
  
  const freelancerSteps = [
    {
      text: 'Create a profile & showcase your skills.',
      image: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80', // Image of someone creating a profile
    },
    {
      text: 'Browse & apply for relevant jobs.',
      image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80', // Image of someone browsing jobs
    },
    {
      text: 'Complete work & get paid securely.',
      image: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80', // Image of someone receiving payment
    },
  ];
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prevStep) => (prevStep + 1) % 3); // Loop through 3 steps
    }, 5000); // 5 seconds delay

    return () => clearInterval(interval); 
  }, []);

  return (
    <div className='home'>
      <div className="mhome">
        <div className="content-wrapper">
          <div className='container-box'>
            <div className="tag">
              <p className='tag-line'>Empowering Freelancers & Employers - Work, Hire, and Collaborate!</p>
              <p className='sub-line'>"FreelanceHub connects talented professionals with businesses looking for quality services. Whether you want to work or hire, we've got you covered!"</p>
            </div>
          </div>
          <h3 className='mheading'>Who can use FreelanceHub?</h3>
          <div className="cards-container">
            <div className="card">
              <h4 className='hcard'>For Freelancers</h4>
              <img src="https://png.pngtree.com/png-vector/20230728/ourmid/pngtree-blog-clipart-freelancer-working-illustration-cartoon-vector-png-image_6801062.png" className='fimg' alt="" />
              <div className="card-content">
                <p><strong>Find High-Paying Gigs –</strong> Get jobs that match your skills.</p>
                <p><strong>Work on Your Own Terms –</strong> Choose projects that suit your schedule.</p>
                <p><strong>Grow Your Career –</strong> Build your portfolio and get more opportunities.</p>
              </div>
            </div>
            <div className="card">
              <h4 className='hcard'>For Employers</h4>
              <img src="data:image/jpeg;base64,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" className='eimg' alt="" />
              <div className="card-content">
                <p><strong>Post Jobs –</strong> Quickly hire skilled freelancers.</p>
                <p><strong>Find suitable freelancers –</strong> Hire based on requirement for your project.</p>
                <p><strong>View the profile -</strong> Freelancer skills, experience before hiring.</p>
              </div>
            </div>
          </div>
          <h3 className='middleheading'>How It Works?</h3>
          <div className="how-container">
            <motion.div
              className="guide"
              initial={{ opacity: 0, x: -100 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h4 className='guide-heading'>📌 For Employers:</h4>
              <div className="step-container">
                <img src={employerSteps[currentStep].image} alt={`Employer Step ${currentStep + 1}`} className="step-image" />
                <p className="step-text">{employerSteps[currentStep].text}</p>
              </div>
            </motion.div>
            <motion.div
              className="guide"
              initial={{ opacity: 0, x: 100 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h4 className='guide-heading'>📌 For Freelancers:</h4>
              <div className="step-container">
                <img src={freelancerSteps[currentStep].image} alt={`Freelancer Step ${currentStep + 1}`} className="step-image" />
                <p className="step-text">{freelancerSteps[currentStep].text}</p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;