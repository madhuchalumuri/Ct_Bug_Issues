import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useNavigate , Link } from 'react-router-dom';
import styles from "../styles/login.module.css"
const SignUp = () => {
  const [state, setState] = useState(
    {  
        username: "",
        email: "",
        password: "",
        role: "user"
      }
  );
  const {username, email, password} = state;
  const navigate = useNavigate();
  const handleChange = (e)=>{
    const { name,value} = e.target;
    setState({...state,[name]: value})

  }
  const handleSubmit = async (e)=>{
    e.preventDefault();
    console.log(state);
    try {
        const response = await axios.post("http://localhost:3000/users", state);
        console.log(response.data);
        navigate('/login');
    }
    catch(error){
        alert("Failed to submit");
        console.log(error.message);
    }
    
  }
  
 
  return (
    <div className={styles.container}>
      <div className={styles.con}>
        <h2>Create an Account</h2>
        <form className={styles.form} onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="username" name='username'
              value={username}
              onChange={handleChange}
              required
            />
            <input
              type="email"
              placeholder="Email" name='email'
              value={email}
              onChange={handleChange}
              required
            />
            <input
              type="password"
              placeholder="Password"
              name='password'
              value={password}
              onChange={handleChange}
              required
            />
            <input className={styles.btn} type='submit' name="submit" />
        </form>
        <p>Already have an account? <Link to="/login">Login</Link></p>
      </div>
    </div>

  );
};

export default SignUp;
