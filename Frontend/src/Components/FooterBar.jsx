import { Box, Button, Typography } from '@mui/material'
import { Link } from 'react-router-dom'

const footerSX = {
  textAlign: 'center',
  backgroundColor: '#7FBF51',
  padding: '20px 0px',
  marginTop: '20px',
}

const footerTextSX = {
  lineHeight: '1',
  color: 'white',
  textDecoration: 'underline',
  fontSize: '1rem',
}

const FooterBar = () => {
  return (
    <Box className='footer flexColumn' sx={footerSX}>
      <Typography sx={{ color: 'white' }}>© 2026 Jacob Skaggs</Typography>
      <Box className='flexRow' sx={{ justifyContent: 'center' }}>
        <Button sx={footerTextSX} component={Link} to='/terms-of-service'>
          Terms of Service
        </Button>
        <Button sx={footerTextSX} component={Link} to='/privacy-policy'>
          Privacy Policy
        </Button>
      </Box>
    </Box>
  )
}

export default FooterBar
