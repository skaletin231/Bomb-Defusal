import { Box, Typography } from '@mui/material'

const GeneralErrorScreen = () => {
  return (
    <Box
      className='content'
      sx={{
        marginTop: '30px',
        boxSizing: 'border-box',
      }}
    >
      <Typography className='bigText'>Something Went Wrong </Typography>
    </Box>
  )
}

export default GeneralErrorScreen
