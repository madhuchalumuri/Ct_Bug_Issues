import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from "axios";
import { ref, uploadBytes, getDownloadURL} from "firebase/storage";
import { storage } from '../firebase/config';
import styles from  "../styles/user.module.css"
import { IoIosCloseCircle } from 'react-icons/io';
import MuiAccordion from "@mui/material/Accordion";
import MuiAccordionSummary from "@mui/material/AccordionSummary";
import MuiAccordionDetails from "@mui/material/AccordionDetails";
import Typography from "@mui/material/Typography";
import { styled } from "@mui/material/styles";
import { FaArrowDown, FaArrowRight, FaSearch } from "react-icons/fa";
import { HiUsers } from "react-icons/hi";
import { FaAward } from "react-icons/fa";


const UserDashboard = () => {
  const { username } = useParams();
  const [ data,setData] = useState([]);
  const [ items,setItems] = useState([]);
  const [ filter, setFilter] = useState([]);
  const [ remainingData, setRemainingData] = useState([]);
  const [open,setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [image, setImage] = useState(null);
  const [description, setDescription] = useState('');
  const [solution, setSolution] = useState('');
  const [category, setCategory] = useState('');
  const [ imgUrl, setImgUrl] = useState(null);
  const [editingIssue, setEditingIssue] = useState(null);
  const [expanded, setExpanded] = useState("panel1");



   // material ui 
   const handleChange1 = (panel) => (event, newExpanded) => {
    setExpanded(newExpanded ? panel : false);
  };

  const Accordion = styled((props) => (
    <MuiAccordion disableGutters elevation={0} square {...props} />
  ))(({ theme }) => ({
    border: `1px solid ${theme.palette.divider}`,
    "&:not(:last-child)": {
      borderBottom: 0,
    },
    "&::before": {
      display: "none",
    },
  }));
  
  const AccordionSummary = styled((props) => (
    <MuiAccordionSummary
      expandIcon={<FaArrowRight className='text-black text-2xl' />}
      {...props}
    />
  ))(({ theme }) => ({
    backgroundColor:
      theme.palette.mode === "dark"
        ? "rgba(255, 255, 255, .05)"
        : "rgba(0, 0, 0, .03)",
    flexDirection: "row-reverse",
    "& .MuiAccordionSummary-expandIconWrapper.Mui-expanded": {
      transform: "rotate(90deg)",
    },
    "& .MuiAccordionSummary-content": {
      marginLeft: theme.spacing(1),
    },
  }));
  
  const AccordionDetails = styled(MuiAccordionDetails)(({ theme }) => ({
    padding: theme.spacing(2),
    borderTop: "1px solid rgba(0, 0, 0, .125)",
  }));


  const handleImgChange = (e)=>{
    console.log(e.target.files[0])
    setImage(e.target.files[0]);
  }


  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!image && !imgUrl) {
      console.log("Please select an image to upload");
      return;
    }
  
    try {
      let imageUrl = imgUrl;
  
      if (image) {
        const storageRef = ref(storage, `images/${image.name}`);
        await uploadBytes(storageRef, image);
        imageUrl = await getDownloadURL(storageRef);
      }
  
      const newIssue = {
        title,
        description,
        image: imageUrl,
        solution,
        category,
        status: 'pending',
      };
  
      // Fetch all pending issues
      const res = await axios.get('http://localhost:3000/pendingIssues');
      const existingUserIssue = res.data.find(issue => issue.createdBy === username);
      const userId = data.find(issue => issue.createdBy === username);
        console.log("existingUserIssue", existingUserIssue);
      if (existingUserIssue) {
        // User already has pending issues, so append the new issue to userIssuesData
        const updatedUserIssuesData = [...existingUserIssue.userIssuesData, newIssue];
  
        // Patch the existing user's pending issues with the new issue added
        await axios.patch(`http://localhost:3000/pendingIssues/${existingUserIssue.id}`, {
          userIssuesData: updatedUserIssuesData
        });
  
        console.log('Issue added successfully to existing pending issues.');
  
        // Update local state with the new data
        setItems(prevData => prevData.map(issue => 
          issue.id === existingUserIssue.id ? { ...issue, userIssuesData: updatedUserIssuesData } : issue
        ));
  
      } else {
        // User doesn't have pending issues, so create a new entry
        const newUserPendingIssue = {
          id:  userId.id, // Generate a unique id for the new issue
          createdBy: username,
          userIssuesData: [newIssue],
        };
  
        const response = await axios.post('http://localhost:3000/pendingIssues', newUserPendingIssue);
        console.log('New issue added successfully:', response.data);
  
        // Update local state with the new entry
        setItems([...data, newUserPendingIssue]);
      }
  
      // Clear form and close modal
      setTitle('');
      setImage(null);
      setDescription('');
      setSolution('');
      setCategory('');
      setOpen(false);
  
    } catch (err) {
      console.error("Error uploading issue:", err.message);
    }
  };
  
  



  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:3000/issues');
        console.log(response.data);
        setData(response.data);
        
      } catch (err) {
        console.error(err.message);
      }
    };
    fetchData();
  }, []);

  // filter data by username
  useEffect(() => {
    if (data.length > 0) {
      const filterData = data.filter(item => item.createdBy === username);
      setFilter(filterData);
      console.log("Filtered Data:", filterData);
      const remainingData = data.filter(item => item.createdBy !== username);
      setRemainingData(remainingData);
      console.log("Remaining Data:", remainingData);
    }
  }, [data, username]);

  const handleUpdate = (id, index) => {
    console.log("Update", id, index);
  };
  const handleDelete = (id, index) => {
    console.log("Delete", id, index);
   
  }

  return (
    <div className={styles.container}>
      <div className={styles.con1}>


      {
            open &&
          
              <form onSubmit={handleSubmit} className={styles.form}>
                <IoIosCloseCircle style={{ position:"absolute", right:"15", fontSize:"25px", cursor:"pointer" }}  onClick={()=>{setOpen(false)}}/>
                <label for="title">Title:</label>
                <input type="text" id="title" name="title" value={title} onChange={(e)=>setTitle(e.target.value)} required/>
                <label for="image">Image:</label>
                <input type="file"  name="image" onChange={handleImgChange} required/>
                <label for="description">Description:</label>
                <textarea id="description" name="description" value={description} onChange={(e)=>setDescription(e.target.value)} required></textarea>
                <label for="solution">Solution:</label>
                <textarea id="solution" name="solution" value={solution} onChange={(e)=> setSolution(e.target.value)} required></textarea>
                <label for="category">Category:</label>
                <select id="category" name="category" value={category} onChange={(e)=> setCategory(e.target.value)} required>
                  <option value="">Select Category</option>
                  <option value="Oracle">Oracle</option>
                  <option value="Java">Java</option>
                  <option value="UI">UI</option>
                </select>
                <input type="submit" value={editingIssue ? "Update" : "Submit"} style={{cursor:"pointer", padding:"12px 0px"}}/>
              </form>
            
          }






        <div className={styles.nav}>
          {/* <h1>User Dashboard</h1> */}
          <p>Welcome, {username}!</p>
          <button className={styles.addIssue} onClick={()=>{setOpen(!open)}} >Add Issue</button>
          
        </div>
        <div className={styles.allIssues}>
          <div className={styles.issues}>
              
              <Accordion
                expanded={expanded === "panel1"}
                onChange={handleChange1("panel1")}
                >
              <AccordionSummary aria-controls="panel1d-content" id="panel1d-header">
                  <Typography style={{display:"flex", alignItems:"center", gap:"10px", fontSize:"20px", fontWeight:"700"}} >Your Contributions <FaAward /> </Typography>
              </AccordionSummary>
            <AccordionDetails>
              {
                filter.length ===0 ? (
                  <p>No issues available for this category</p>
                ) : (
                  filter.map(issue =>(
                    issue.userIssuesData.length > 0 && (
                      <div className={styles.con2} key={issue.id}>
                        {/* <h1>Created by : {issue.createdBy}</h1> */}
                        {
                          issue.userIssuesData.map((problem, index)=>{
                            return(
                              <div key={index} style={{borderBottom:"1px solid black", paddingBottom:"20px"}} >
                              <span>
                                <p>Title: {problem.title}</p>
                                <p>Description: {problem.description}</p>
                              </span>
                              <span className={styles.imgContainer}>
                                <img src={problem.image} alt={problem.title} style={{ width: "100px" }} />
                                <span>
                                  <p><span className={styles.heading}>Category:</span><br/> {problem.category}</p>
                                  <p><span className={styles.heading}> Suggested Solution:</span><br/> {problem.solution}</p>
                                </span>
                              </span>
                              {/* <span className={styles.btns}>
                                <button onClick={() => { handleUpdate(issue.id, index) }} style={{backgroundColor:"blue"}}>Edit</button>
                                <button onClick={() => { handleDelete(issue.id, index) }} style={{backgroundColor:"red"}} >Delete</button>
                              </span> */}
                            </div>
                            )
                          
                          })
                        }
                        
                      </div>
                    )
                  ))
                )
              }
               </AccordionDetails>
               </Accordion>
               
              
              
             <div className={styles.remainingIssues}>
             {/* <h1>All issues</h1> */}
             <Accordion
                expanded={expanded === "panel1"}
                onChange={handleChange1("panel1")}
                >
              <AccordionSummary aria-controls="panel1d-content" id="panel1d-header">
                  <Typography style={{display:"flex", alignItems:"center", gap:"10px", fontSize:"20px", fontWeight:"700"}}>All Users <HiUsers /> </Typography>
              </AccordionSummary>
            <AccordionDetails>
                {
                  remainingData.length ===0 ? (
                    <p>No issues available for this category</p>
                  ) : (
                    remainingData.map(issue =>(
                      issue.userIssuesData.length > 0 && (
                        <div className={styles.con2} key={issue.id}>
                          {/* <h1>Created by : {issue.createdBy}</h1> */}
                          {
                            issue.userIssuesData.map((problem, index)=>{
                              return(
                                <div key={index} style={{borderBottom:"1px solid black", paddingBottom:"20px"}} >
                                <span>
                                  <p>Title: {problem.title}</p>
                                  <p>Description: {problem.description}</p>
                                </span>
                                <span className={styles.imgContainer}>
                                  <img src={problem.image} alt={problem.title} style={{ width: "100px" }} />
                                  <span>
                                    <p><span className={styles.heading}>Category:</span><br/> {problem.category}</p>
                                    <p><span className={styles.heading}> Suggested Solution:</span><br/> {problem.solution}</p>
                                  </span>
                                </span>
                                {/* <span className='btns'>
                                  <button onClick={() => { handleUpdate(issue.id, index) }} style={{backgroundColor:"blue"}}>Edit</button>
                                  <button onClick={() => { handleDelete(issue.id, index) }} style={{backgroundColor:"red"}} >Delete</button>
                                </span> */}
                              </div>
                              )
                            
                            })
                          }
                        </div>
                      )
                    ))
                  )
                }
                 </AccordionDetails>
                 </Accordion>
             </div>
  
          </div>
        </div>
      </div>

    </div>
  );
};

export default UserDashboard;
