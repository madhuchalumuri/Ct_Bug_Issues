import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from  "../styles/login.module.css"


const LoginPage = () => {
  const [state, setState] = useState({
    email: '',
    password: ''
  });
  const [users, setUsers] = useState([]);
  const { email, password } = state;
  const navigate = useNavigate();

  const handleChange = (e)=>{
        const { name, value } = e.target;
        setState({...state,[name]:value});
  }

  
    useEffect(() => {
        const fetchData = async () => {
          try {
            const response = await axios.get('http://localhost:3000/users');
            console.log(response.data);
            setUsers(response.data);
          } catch (err) {
            console.error(err.message);
          }
        };
        fetchData();
      }, []);

      const handleSubmit = (e)=>{
        e.preventDefault();
        const user = users.find( user => user.email ===email && user.password === password);
        console.log("user:",user);
        if(user){
          if(user.role === 'admin') {
            navigate('/admin');
          }
          else if(user.role === 'user'){
              navigate(`/user/${user.username}`);
          }
        }
        else{
            alert('Invalid Credentials');
        }
      }


  return (
    <div className={styles.container}>
      <div className={styles.con}>
        <h2>Account Login</h2>
         <form className={styles.form} onSubmit={handleSubmit}>
          <label for="email">Email:</label>
             <input
              type="email"
              placeholder="Email" name='email'
              value={email}
              onChange={handleChange}
              required
            />
            <label for="password">Password:</label>
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
         <p>Don't have an account? <a href="/signup">Sign Up</a></p>
        
      </div>
    </div>
  );
};

export default LoginPage;
