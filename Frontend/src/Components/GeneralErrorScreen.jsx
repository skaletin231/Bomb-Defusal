import { Box, Typography } from '@mui/material'

const GeneralErrorScreen = ({ noPageError = false }) => {
  const pageError = noPageError
    ? 'Error 404: Page Not Found'
    : 'Something Went Wrong'
  return (
    <Box
      className='content'
      sx={{
        marginTop: '30px',
        boxSizing: 'border-box',
      }}
    >
      <Typography className='bigText'>{pageError}</Typography>
    </Box>
  )
}

export default GeneralErrorScreen
