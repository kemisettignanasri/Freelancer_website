import React, { useContext } from 'react';
import { useNavigate,useLocation } from 'react-router-dom';
import './Header.css';
import { employerLoginContext } from '../../contexts/employerLoginContext';
import { freelancerLoginContext } from '../../contexts/freelancerLoginContext';

function Header() {
  const { currentFreelancer, logoutFreelancer, freelancerLoginStatus } = useContext(freelancerLoginContext);
  const { currentEmployer, logoutEmployer, employerLoginStatus } = useContext(employerLoginContext);

  const navigate = useNavigate();
  const location = useLocation();

  const isFreelancer = freelancerLoginStatus;
  const isEmployer = employerLoginStatus;
  const currentUser = isFreelancer ? currentFreelancer : isEmployer ? currentEmployer : null;
  const logoutUser = isFreelancer ? logoutFreelancer : isEmployer ? logoutEmployer : null;
  const userLoginStatus = isFreelancer || isEmployer;


  const freelancerDashboardPath = '/freelancerdashboard';
  const employerDashboardPath = '/employerdashboard';
  const isOnDashboard = location.pathname === freelancerDashboardPath || location.pathname === employerDashboardPath;

  const handleLogout = () => {
    if (logoutUser) {
      logoutUser();  
      navigate('/login'); 
    }
  };

  const navigateToDash=()=>{
    if(currentUser.userType=='Employer'){
      navigate('/employerdashboard')
    }
    else{
      navigate('/freelancerdashboard')
    }
  }

  return (
    <div className='head'>
      <div className="logo d-flex">
        <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR2KlKcWFkYzF1zMopQFL68WtIp_RSCqNN_bfxypNxd0jX5j6IZwYXXjpiFZnjQyYapBh4&usqp=CAU" 
          height={50} width={50} alt="Logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}/>
          <h4 className='name' onClick={() => navigate('/')}>FreelanceHub</h4>
      </div>
      <div className="auth-buttons">
        {!userLoginStatus ? (  
          <>
            <button onClick={() => navigate('/login')} className="login">Login</button>
            <button onClick={() => navigate('/register')} className="signup">Signup</button>
          </>
        ) : (  
          <>
            <span className="username">{currentUser?.username}</span>  { }
            {!isOnDashboard && <button onClick={navigateToDash} className='logout'>DashBoard</button>}
            <button onClick={handleLogout} className="logout">Logout</button>
            
          </>
        )}
      </div>
    </div>
  );
}

export default Header;