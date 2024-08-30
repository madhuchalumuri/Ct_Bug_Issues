import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { IoIosCloseCircle } from 'react-icons/io';
import { ref, uploadBytes, getDownloadURL} from "firebase/storage";
import { storage } from '../firebase/config';
import { GrDocumentTime } from 'react-icons/gr';
import styles from "../styles/admin.module.css"
import Badge from '@mui/material/Badge';
import { styled } from '@mui/material/styles';
import IconButton from '@mui/material/IconButton';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import MuiAccordion from "@mui/material/Accordion";
import MuiAccordionSummary from "@mui/material/AccordionSummary";
import MuiAccordionDetails from "@mui/material/AccordionDetails";
import Typography from "@mui/material/Typography";
import { FaArrowDown, FaArrowRight, FaSearch } from "react-icons/fa";
import { HiUsers } from "react-icons/hi";
import { FaAward } from "react-icons/fa";
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Slide from '@mui/material/Slide';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});
const AdminDashboard = () => {
  const [ data,setData] = useState([])
  const [ pendingData, setPendingData ] = useState([])
  const [open,setOpen] = useState(false);
  const [pending, setPending]  = useState(false);
  const [title, setTitle] = useState('');
  const [image, setImage] = useState(null);
  const [description, setDescription] = useState('');
  const [solution, setSolution] = useState('');
  const [category, setCategory] = useState('');
  const [ imgUrl, setImgUrl] = useState(null);
  const [ imageUploaded, setImageUploaded ] = useState("");
  const [editingIssue, setEditingIssue] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [ pendingNubmers, setPendingNubmers] = useState(0);
  const [expanded, setExpanded] = useState("panel1");
  const [ issues, setIssues] = useState([])
  const [ approve, setApprove] = useState([]);
  const [ users, setUsers] = useState([]);
  const [dailogOpen, setdailogOpen] = useState(false);
  const [ dailogText, setDailogText] = useState({});

  
  const StyledBadge = styled(Badge)(({ theme }) => ({
    '& .MuiBadge-badge': {
      right: -3,
      top: 13,
      border: `2px solid ${theme.palette.background.paper}`,
      padding: '0 4px',
      color:"white"
    },
  }));


  
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



    // Event Listers -------------------------

    const handleImgChange = (e)=>{
      // console.log(e.target.files[0])
      setImage(e.target.files[0]);
    }
    
    const handleDelete = (issueId, problemIndex) => {
      // Remove the problem from local state
      const updatedIssues = data.map(issue =>
        issue.id === issueId
          ? {
              ...issue,
              userIssuesData: issue.userIssuesData.filter((_, index) => index !== problemIndex),
            }
          : issue
      );
  
      const updatedIssue = updatedIssues.find(issue => issue.id === issueId);
  
      // Remove the issue if its userIssuesData is empty
      if (updatedIssue && updatedIssue.userIssuesData.length === 0) {
        axios.delete(`http://localhost:3000/issues/${issueId}`)
          .then(() => {
            // Update local state to remove the issue
            setData(updatedIssues.filter(issue => issue.id !== issueId));
          })
          .catch(error => {
            console.error('Error deleting issue:', error);
          });
      } else {
        // Otherwise, just update the issue with the empty userIssuesData
        axios.patch(`http://localhost:3000/issues/${issueId}`, {
          userIssuesData: updatedIssue.userIssuesData
        })
          .then(() => {
            // Update local state
            setData(updatedIssues);
          })
          .catch(error => {
            console.error('Error updating issue:', error);
          });
      }
    };

    const handleUpdate = (issueId, problemIndex) => {
      const issueToEdit = data.find(issue => issue.id === issueId);
      if (issueToEdit) {
        const problemToEdit = issueToEdit.userIssuesData[problemIndex];
        setTitle(problemToEdit.title);
        setDescription(problemToEdit.description);
        setSolution(problemToEdit.solution);
        setCategory(problemToEdit.category);
        setImgUrl(problemToEdit.image);
        setImage(null);  // Reset image in case a new image isn't provided
        setEditingIssue({ issueId, problemIndex });
        setOpen(true);  // Open the form for editing
      }
    };
    

    const handleSubmit = async (e)=>{
      e.preventDefault();
      if (!image && !imgUrl) {
        console.log("Please select an image to upload");
        return;
      }
      try{
        let imageUrl = imgUrl;
        if (image) {
        const storageRef = ref(storage, `images/${image.name}`)
        await uploadBytes(storageRef, image);
        imageUrl = await getDownloadURL(storageRef);
        }

        const newIssue = {
          id: editingIssue ? null : "c2d4", 
          createdBy : "admin",
          userIssuesData : [
            {
              title,
              description,
              image:imageUrl,
              solution,
              category,
              status : 'open'

            }
          ]
        }
        if (editingIssue) {
          const { issueId, problemIndex } = editingIssue;
          const updatedIssues = data.map(issue =>
            issue.id === issueId
              ? {
                  ...issue,
                  userIssuesData: issue.userIssuesData.map((problem, index) =>
                    index === problemIndex ? newIssue.userIssuesData[0] : problem
                  )
                }
              : issue
          );
  
          await axios.patch(`http://localhost:3000/issues/${issueId}`, {
            userIssuesData: updatedIssues.find(issue => issue.id === issueId).userIssuesData
          });
  
          setData(updatedIssues);
          setEditingIssue(null);
        }
        else{

        

      const res = await axios.get('http://localhost:3000/issues');
    const adminIssue = res.data.find(issue => issue.createdBy === 'admin');

    if (adminIssue) {
      // Admin issue already exists, so append to the userIssuesData array
      const updatedUserIssuesData = [...adminIssue.userIssuesData, ...newIssue.userIssuesData];

      // Patch the admin issue with the updated data
      await axios.patch(`http://localhost:3000/issues/${adminIssue.id}`, {
        userIssuesData: updatedUserIssuesData
      });

      console.log('Issue added successfully to admin data.');
      
      // Update local state with the new data
      setData(prevData => prevData.map(issue => 
        issue.id === adminIssue.id ? { ...issue, userIssuesData: updatedUserIssuesData } : issue
      ));
      
    }
    else{
      const newAdminIssue = {
         // you can generate a unique id or use something unique
        createdBy: "admin",
        userIssuesData: [newIssue]
      
    };

        const response = await axios.post('http://localhost:3000/issues', newIssue);
        console.log('Issue added successfully:', response.data);
        // Update local state with the new issue
        setData([...data, newIssue]);
    }
  }
        // Clear form and close modal
        setTitle('');
        setImage(null);
        setDescription('');
        setSolution('');
        setCategory('');
        setOpen(false);
  
      }catch(err){
        console.error("ki",err.message);
      }


    }

    useEffect(()=>{
      const fetchData = async ()=>{
          try{
            const response = await axios.get("http://localhost:3000/issues");
            setData(response.data);
            console.log("data",response.data);
          }
          catch(error){
            console.error(error.message);
          }
      }
      fetchData();
    },[])
    useEffect(()=>{
      const pendingData1 = async ()=>{
        try{
          const res = await axios.get("http://localhost:3000/pendingIssues");
          setPendingData(res.data);
          setPendingNubmers(res.data.length);
          console.log("pendingNumbers",res.data.length);

        }
        catch(error){
          console.error(error.message);
        }
      }
      pendingData1();
    },[pending]);

    useEffect(() => {
      const fetchIssues = async () => {
        try {
          const response = await axios.get('http://localhost:3000/issues');
          setIssues(response.data);
        } catch (error) {
          console.error("Error fetching issues:", error);
        }
      };
    
      fetchIssues();
    }, []);
    useEffect(() => {
      const userData = async () => {
        try {
          const response = await axios.get('http://localhost:3000/users');
          console.log("users",response.data);
          setUsers(response.data);
          
        } catch (err) {
          console.error(err.message);
        }
      };
      userData();
    }, []);


    useEffect(()=> {
        
    },[dailogOpen])
    
    const handleClickOpen =async  (issueId, problemIndex) => {
      setdailogOpen(true);
      console.log("issue: " + issueId);
      console.log("problemIndex: " + problemIndex);
      const dailogData =  data.filter(dailog => dailog.id === issueId)
      console.log(dailogData[0])
      setDailogText(dailogData[0].userIssuesData[problemIndex]);
      console.log(dailogText);
    };
  
    const handleClose = () => {
      setdailogOpen(false);
    };
  

    const filteredIssues = data.map(issue => ({
      ...issue,
      userIssuesData: issue.userIssuesData.filter(problem =>
        selectedCategory === 'All' || problem.category === selectedCategory
      )
    }));

    const handleApprove = async (issueId,problemIndex) => {
          
            try{
                const issueToApprove =  pendingData.find(issue => issue.id === issueId);
                console.log("issueId: " + issueId);
                console.log("issueIndex: " + problemIndex);


                if(issueToApprove){
                  console.log("issueToApprove", issueToApprove);
                  const approvedIssue = issueToApprove.userIssuesData[problemIndex];
                  console.log("approvedIssue", approvedIssue);
                  const  allissues = await axios.get(`http://localhost:3000/issues`);
                  console.log("320", allissues.data)
                  const existingIssues = allissues.data.find(issue => issue.id === issueId);
                  console.log("321", existingIssues);
                  const newApproveduser = users.filter(user => user.id === issueId);
                  console.log("321", users)
                  console.log("341",newApproveduser)
                  if(existingIssues){
                    const updatingPendingIssue = [...existingIssues.userIssuesData,approvedIssue];
                    await axios.patch(`http://localhost:3000/issues/${issueId}`, { userIssuesData: updatingPendingIssue });
                    console.log("done..")
                  }
                  else{
                    console.log("No existing issues");
                    const newIssue = {
                        id: issueId,
                        createdBy: "jack",
                        userIssuesData: [approvedIssue]
                    };
                    await axios.post('http://localhost:3000/issues', newIssue);
                    console.log("new issue added")

                  }

                  const updatingPendingIssue = issueToApprove.userIssuesData.filter((_, index) => index !== problemIndex);
                  if (updatingPendingIssue.length === 0) {
                    await axios.delete(`http://localhost:3000/pendingIssues/${issueId}`);
                  } else {
                    await axios.patch(`http://localhost:3000/pendingIssues/${issueId}`, { userIssuesData: updatingPendingIssue });
                  }
                  
                  // Update pending issues
                  // setPendingData(prevPendingData => prevPendingData.filter(issue => issue.id !== issueId));
                  setPending(!pending)
                }
            
            }catch(error){
              console.error("error approving issue",error);
            }
    };
    
    
    
    
    

  return (
    <div className={styles.container} >

    <div className={styles.screen}>
       <div className={styles.con}>
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
          <div className={styles.pendingContainer}>
            {
              pending && 
              <div className={styles.pending}>
                 <Accordion
                expanded={expanded === "panel1"}
                onChange={handleChange1("panel1")}
                >
              <AccordionSummary aria-controls="panel1d-content" id="panel1d-header">
                <Typography >
                    <span style={{display:"flex", justifyContent:"space-between", alignItems:"center", padding:"0px 30px",width:"70vw" }}>
                      <h3 style={{display:"flex", alignItems:"center", gap:"10px", fontSize:"20px", fontWeight:"700"}}> <HiUsers /> Pending Issues </h3>
                      <IoIosCloseCircle style={{  fontSize:"30px", cursor:"pointer", color:"red" }}  onClick={()=>{setPending(false)}}/>
                    </span>
                </Typography>
              </AccordionSummary>
            <AccordionDetails>
               
                {
                pendingData.length === 0? (
                  <p>No pending issues.</p>
                ) : (
                  pendingData.map(issue => (
                    <div key={issue.id} style={{ boxShadow: "4px 4px 4px 4px rgba(0,0,0,0.9)", margin: "10px", padding: "10px", backgroundColor:"white" }}>
                      <p>User ID: {issue.id}</p>
                      <h1>Created by: {issue.createdBy}</h1>
                      {issue.userIssuesData.map((problem, index) => (
                        <div key={index} style={{ borderTop: "1px solid black" }}>
                           <span>
                          <p><span className={styles.heading}>Title:</span > {problem.title}</p>
                          <p><span className={styles.heading}>Description:</span> {problem.description}</p>
                        </span>
                        <span className={styles.imgContainer}>
                          <img src={problem.image} alt={problem.title} style={{ width: "100px" }} />
                          <span>
                            <p><span className={styles.heading}>Category:</span><br/> {problem.category}</p>
                            <p><span className={styles.heading}> Suggested Solution:</span><br/> {problem.solution}</p>
                            <button onClick={() => handleApprove(issue.id,index)} className={styles.approveBtn}>Approve</button>
                          </span>
                        </span>
                        
                        </div>
                      ))}
                    </div>
                  )))}
                  </AccordionDetails>
                  </Accordion>
            </div>
            }
          </div>
          
            
        <div className={styles.navbar} >
          <span className={styles.items}>
            <Link className={`${styles.link} ${selectedCategory === 'All' ? styles.selected : ''}`} to="#"  onClick={() => setSelectedCategory('All')}>All</Link>
            <Link className={`${styles.link} ${selectedCategory === 'Oracle' ? styles.selected : ''}`} to="#" onClick={() => setSelectedCategory('Oracle')}>Oracle</Link>
            <Link className={`${styles.link} ${selectedCategory === 'Java' ? styles.selected : ''}`} to="#" onClick={() => setSelectedCategory('Java')}>Java</Link>
            <Link className={`${styles.link} ${selectedCategory === 'UI' ? styles.selected : ''}`} to="#"  onClick={() => setSelectedCategory('UI')}>UI</Link>
          </span>
          <span className={styles.items} >
            {/* <GrDocumentTime onClick={()=>{setPending(!pending); console.log(pending)}} style={{fontSize:"22px", cursor:"pointer" }}/> */}
                <IconButton aria-label="cart" onClick={()=>{setPending(!pending);}} style={{fontSize:"22px", cursor:"pointer" }} >
                  <StyledBadge badgeContent={pendingNubmers} color="secondary">
                    <PendingActionsIcon style={{ fontSize:"35px", color:"white"}} />
                  </StyledBadge>  
                </IconButton>
            <button onClick={()=>{setOpen(!open)}} className={styles.addIssue} >Add Issue</button>
          </span>
          
        </div>
        <div className={styles.allIssues}>
          <h2>Issues</h2>
          <div className={styles.issues}>
          <Accordion
                expanded={expanded === "panel1"}
                onChange={handleChange1("panel1")}
                >
              <AccordionSummary aria-controls="panel1d-content" id="panel1d-header">
                  <Typography style={{display:"flex", alignItems:"center", gap:"10px", fontSize:"20px", fontWeight:"700"}}>All Users <HiUsers /> </Typography>
              </AccordionSummary>
            <AccordionDetails>
            {filteredIssues.length === 0 ? (
              <p>No issues available for this category.</p>
            ) : (
              filteredIssues.map(issue => (
                issue.userIssuesData.length > 0 && (
                  <div className={styles.con2} key={issue.id} >
                    {/* <p>User ID: {issue.id}</p> */}
                    <h1>Created by: {issue.createdBy}</h1>
                    {issue.userIssuesData.map((problem, index) => (
                      <div key={index} style={{borderBottom:"1px solid black", paddingBottom:"20px"}} >
                        <span>
                          <p><span className={styles.heading}>Title:</span> {problem.title}</p>
                          <p><span className={styles.heading}>Description: </span>{problem.description}</p>
                        </span>
                        <span className={styles.imgContainer}>
                          <img src={problem.image} alt={problem.title} style={{ width: "100px" }} />
                          <span>
                            <p><span className={styles.heading}>Category:</span><br/> {problem.category}</p>
                            <p><span className={styles.heading}> Suggested Solution:</span><br/> {problem.solution}</p>
                            <h4 className={styles.readbtn} onClick={()=>{handleClickOpen(issue.id,index)}}>Read More..</h4>
                          </span>
                        </span>
                        <span className={styles.btns}>
                          <button onClick={() => { handleUpdate(issue.id, index) }} style={{backgroundColor:"blue", cursor:"pointer"}}>Edit</button>
                          <button onClick={() => { handleDelete(issue.id, index) }} style={{backgroundColor:"red", cursor:"pointer"}} >Delete</button>
                        </span>
                      </div>
                    ))}
                  </div>
                )
              ))
            )}
            </AccordionDetails>
            </Accordion>
          </div>
                  
                  {/* // dailog ui */}

                  <Dialog 
        open={dailogOpen}
        TransitionComponent={Transition}
        keepMounted
        onClose={handleClose}
        aria-describedby="alert-dialog-slide-description"
      >
        {/* <DialogTitle>{"Use Google's location service?"}</DialogTitle> */}
        <DialogContent >
          <DialogContentText id="alert-dialog-slide-description" className={styles.dailog}>
          {dailogText ? (
        <div  className={styles.dailogText}>
          <p>Title: {dailogText.title}</p>
          <p>Category: {dailogText.category}</p>
          <img src={dailogText.image} alt={dailogText.title} style={{ width: "400px" }} />
          <p>Description: {dailogText.description}</p>
          <p>Solution: {dailogText.solution}</p>
        
        </div>
      ) : (
        "Loading..."
      )}

          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <button className={styles.dailogBtn} onClick={handleClose}>Close</button>
        </DialogActions>
      </Dialog>
        
        </div>
       </div>
    </div>

      
    </div>
  );
};

export default AdminDashboard;
