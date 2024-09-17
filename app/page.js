'use client'

import { useState, useEffect, useRef } from 'react'
import { Box, Stack, Typography, Button, Modal, TextField } from '@mui/material'
import { Camera } from 'react-camera-pro'
import { firestore } from '@/firebase'
import {
  collection,
  doc,
  getDocs,
  query,
  setDoc,
  deleteDoc,
  getDoc,
} from 'firebase/firestore'

import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase'; // Adjust the path as necessary
import { useAuth } from '../context/AuthContext'; // Import your custom hook

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'white',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
  display: 'flex',
  flexDirection: 'column',
  gap: 3,
}

const cameraBoxStyle = {
  width: '100%',
  height: '300px',
  border: '2px solid #333',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
}

const rootStyle = {
  backgroundColor: '#000', // Set background color to black
  color: '#fff', // Set text color to white for better contrast
  width: '100vw',
  height: '100vh',
  display: 'flex',
  justifyContent: 'center',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 2,
}

export default function Home() {
  const [inventory, setInventory] = useState([])
  const [open, setOpen] = useState(false)
  const [cameraOpen, setCameraOpen] = useState(false)
  const [itemName, setItemName] = useState('')
  const cameraRef = useRef(null)
  const [capturedImage, setCapturedImage] = useState(null)
  const [imageDescription, setImageDescription] = useState('')
  const { user } = useAuth(); // Access the user from context
  const router = useRouter();

  const [loading,setLoading] = useState(false);

  useEffect(() => {
    if (user === undefined) {
      // Still checking for user authentication status
      return;
    }
  
    if (user === null) {
      // Redirect to login if user is not authenticated
      router.push('/home');
    } else {
      // User is authenticated, fetch their inventory
      setLoading(false);
      updateInventory();  // Fetch user-specific inventory
    }
  }, [user, router]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/home');  // Redirect to the home page after logging out
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const updateInventory = async () => {
    if (!user) return;  // Ensure user is authenticated
    
    const userInventoryRef = collection(firestore, `users/${user.uid}/inventory`);
    const snapshot = query(userInventoryRef);
    const docs = await getDocs(snapshot);
    const inventoryList = [];
    
    docs.forEach((doc) => {
      inventoryList.push({ name: doc.id, ...doc.data() });
    });
    
    setInventory(inventoryList);
  };
  
  useEffect(() => {
    updateInventory()
  }, [])

  const addItem = async (item) => {
    if (!user) return;  // Ensure user is authenticated
    
    const docRef = doc(collection(firestore, `users/${user.uid}/inventory`), item);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const { quantity } = docSnap.data();
      await setDoc(docRef, { quantity: quantity + 1 });
    } else {
      await setDoc(docRef, { quantity: 1 });
    }
    
    await updateInventory();
  };

  const removeItem = async (item) => {
    if (!user) return;  // Ensure user is authenticated
    
    const docRef = doc(collection(firestore, `users/${user.uid}/inventory`), item);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const { quantity } = docSnap.data();
      if (quantity === 1) {
        await deleteDoc(docRef);
      } else {
        await setDoc(docRef, { quantity: quantity - 1 });
      }
    }
    
    await updateInventory();
  };

  const increaseItemQuantity = async (item) => {
    if (!user) return;  // Ensure user is authenticated
    
    const docRef = doc(collection(firestore, `users/${user.uid}/inventory`), item);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const { quantity } = docSnap.data();
      await setDoc(docRef, { quantity: quantity + 1 });
    }
    
    await updateInventory();
  };

  const handleOpen = () => setOpen(true)
  const handleClose = () => setOpen(false)
  
  const handleCameraOpen = () => setCameraOpen(true)
  const handleCameraClose = () => setCameraOpen(false)

  const capturePhoto = async () => {
    const imageSrc = cameraRef.current.takePhoto(); // Captures the image as a Base64-encoded JPEG string
    console.log(imageSrc); // This is the Base64 string representing the .jpg image
    setCapturedImage(imageSrc);
  
    try {
      // Send the image as a Base64-encoded string in the POST request
      const apiResponse = await fetch('/api/describe-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image: imageSrc }), // This Base64 string represents the .jpg image
      });
  
      if (apiResponse.ok) {
        const { description } = await apiResponse.json();
        setImageDescription(description);
  
        // Use the description as the item name and add it
        await addItem(description.trim());
  
      } else {
        console.error('Error from API:', await apiResponse.text());
        setImageDescription('Failed to generate description.');
      }
    } catch (error) {
      console.error('Error communicating with the server:', error);
      setImageDescription('Error occurred while processing the image.');
    }
  
    handleCameraClose(); // Close the camera after capturing the photo
  };

  return (

    <>

    <Box sx={rootStyle}>
    <Typography 
        variant="p" 
        sx={{ color: 'green', fontFamily: 'Arial, sans-serif' }}
      >
        Add items using a camera or manually
      </Typography>

      <p></p>

      {/* Modal for Adding New Item */}
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={modalStyle}>
          <Typography id="modal-modal-title" variant="h6" component="h2" >
            Add Item
          </Typography>
          <Stack width="100%" direction={'row'} spacing={2}>
            <TextField
              id="outlined-basic"
              label="Item"
              variant="outlined"
              fullWidth
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
            />
            <Button
              variant="contained"
              color="success"
              onClick={() => {
                addItem(itemName)
                setItemName('')
                handleClose()
              }}
            >
              Add
            </Button>
          </Stack>
        </Box>
      </Modal>
      
      {/* Modal for Camera */}
      <Modal
        open={cameraOpen}
        onClose={handleCameraClose}
        aria-labelledby="camera-modal-title"
        aria-describedby="camera-modal-description"
      >
        <Box sx={{ ...modalStyle, width: 600 }}>
          <Typography id="camera-modal-title" variant="h6" component="h2">
            Capture
          </Typography>
          <Box sx={cameraBoxStyle}>
            <Camera ref={cameraRef} />
          </Box>
          <Stack direction="row" justifyContent="space-between" mt={2}>
            <Button variant="contained" color="success" onClick={capturePhoto}>
              Capture
            </Button>
            <Button variant="contained" color="success" onClick={handleCameraClose}>
              Close
            </Button>
          </Stack>
        </Box>
      </Modal>
      <Box display="flex" alignItems="center" gap={2}>
      <Button variant="contained" color="success" onClick={handleOpen}>
        Manual Enter
      </Button>
      <Button 
        variant="contained" 
        color="success"
        sx={{ padding: '8px', minWidth: 'auto' }} // Optional: Adjust padding and width
        onClick={handleCameraOpen}
      >
        Camera Enter
      </Button>
    </Box>

      <Box border={'1px solid #333'}>
        <Box
          width="800px"
          height="100px"
          display={'flex'}
          justifyContent={'center'}
          alignItems={'center'}
        >
          <Typography variant={'h2'} color={'#fff'} textAlign={'center'}>
            Inventory Items
          </Typography>
        </Box>
        <Stack width="800px" height="300px" spacing={2} overflow={'auto'}>
          {inventory.map(({ name, quantity }) => (
            <Box
              key={name}
              width="100%"
              minHeight="150px"
              display={'flex'}
              justifyContent={'space-between'}
              alignItems={'center'}
              bgcolor={'#444'} // Slightly lighter background for items
              paddingX={5}
            >
              <Typography variant={'h3'} color={'#fff'} textAlign={'center'}>
                {name.charAt(0).toUpperCase() + name.slice(1)}
              </Typography>
              <Typography variant={'h3'} color={'#fff'} textAlign={'center'}>
                Quantity: {quantity}
              </Typography>
              <Stack direction="row" spacing={2}>
                <Button variant="contained" color="success" onClick={() => increaseItemQuantity(name)}>
                  +
                </Button>
                <Button variant="contained" color="success" onClick={() => removeItem(name)}>
                  Remove
                </Button>
              </Stack>
            </Box>
          ))}
          
        </Stack>
      </Box>

      <Button 
              sx={{ bgcolor: 'black', ':hover': { bgcolor: 'green' } }} 
              variant="contained" 
              onClick={handleLogout}
            >
              Logout
      </Button>
    </Box>

    </>
  )
}
