'use client'

import { Box, Button, Stack, Typography } from '@mui/material'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()

  const handleSignUpClick = () => {
    router.push('/signUp') // Navigate to the sign-up page
  }

  const handleSignInClick = () => {
    router.push('/signIn') // Navigate to the sign-in page
  }

  return (
    <Box
      width="100vw"
      height="100vh"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      sx={{ bgcolor: 'black' }}
    >
      <Stack
        direction="column"
        spacing={4}
        alignItems="center"
      >

<Stack direction="row" spacing={2}>
        <img
          src="/images/fresh-apple-black-desk.jpg" // Adjusted path
          alt="Fresh Apple"
          width={100} 
          height={100}
          style={{ borderRadius: '50%' }}
        />
        <img
          src="/images/front-view-fresh-banana-black-background-color-ripe-mellow-tree-exotic-tasty-darkness-photo.jpg" // Adjusted path
          alt="Fresh Banana"
          width={100} 
          height={100}
          style={{ borderRadius: '50%' }}
        />
      </Stack>
        <Typography color="green" variant="b" component="h1">
          Welcome to VisionPantry
        </Typography>

        <Typography color="green" variant="" component="h5">
          VisionPantry allows you to track your pantry items through capturing your desire item.
        </Typography>
        
        <Typography color="green" variant="" component="h5">
          If you choose to, you can always enter it manually.
        </Typography>
        <Stack direction="row" spacing={2}>
          <Button
            sx={{ bgcolor: 'black', ':hover': { bgcolor: 'green' } }}
            variant="contained"
            onClick={handleSignUpClick}
          >
            Sign Up
          </Button>
          <Button
            sx={{ bgcolor: 'black', ':hover': { bgcolor: 'green' } }}
            variant="contained"
            onClick={handleSignInClick}
          >
            Sign In
          </Button>
        </Stack>
      </Stack>
    </Box>
  )
}
