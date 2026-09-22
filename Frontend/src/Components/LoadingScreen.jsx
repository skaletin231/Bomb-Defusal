import { Box, Typography } from '@mui/material'

const LoadingScreen = () => {
  return (
    <Box
      className='content'
      sx={{
        marginTop: '30px',
        boxSizing: 'border-box',
      }}
    >
      <Typography className='bigText'>Loading ... </Typography>
    </Box>
  )
}

export default LoadingScreen
