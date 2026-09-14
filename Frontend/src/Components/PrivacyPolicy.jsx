import { Box, Divider, Typography } from '@mui/material'

const PrivacySX = {
  gap: '10px',
  my: '20px',
  '& p.bigText': {
    color: 'black',
  },
  '& p.normalText': {
    color: 'black',
    fontWeight: 'normal',
  },
}

const PrivacyPolicy = () => {
  return (
    <Box className='privacyPolicy flexColumn content' sx={PrivacySX}>
      <Box>
        <Typography className='mainHeader'>Privacy Policy</Typography>
        <Typography sx={{ color: '#808080', fontStyle: 'italic' }}>
          Last updated: 9/14/2026
        </Typography>
      </Box>

      <Divider />

      <Box>
        <Typography className='bigText'>1. Information We Collect</Typography>
        <Typography className='normalText'>
          We collect information you provide directly to us, including your
          email address, username, and any content you create or upload to our
          platform.
        </Typography>
      </Box>

      <Box>
        <Typography className='bigText'>
          2. How We Use Your Information
        </Typography>
        <Typography className='normalText'>
          We use the information we collect to provide and maintain our
          services, including:
        </Typography>
        <ul
          style={{
            fontSize: '1.2rem',
            color: 'black',
            fontFamily: '"reddit sans", serif',
            margin: '0px',
          }}
        >
          <li>Maintaining user accounts and authentication</li>
          <li>Saving game progress</li>
          <li>Storage of user-generated content</li>
        </ul>
      </Box>

      <Box>
        <Typography className='bigText'>3. Third-Party Services</Typography>
        <Typography className='normalText'>
          We use Auth0 (provided by Okta, Inc.) to manage registration, user
          authentication, and secure login services for our website. When you
          create an account or sign in, certain personal information, such as
          your name, email address, password, and public profile data (if using
          Google login), is transmitted directly to and processed by Auth0 on
          our behalf. Auth0 acts as a third-party data processor and relies on
          essential security and session cookies to authenticate users and
          prevent unauthorized access. For more details on how your data is
          protected, please review the Auth0{' '}
          <a
            style={{ color: 'black' }}
            href='https://www.okta.com/legal/privacy-policy/'
            target='_blank'
            rel='noopener noreferrer'
          >
            Privacy Policy
          </a>
          .
        </Typography>
      </Box>

      <Box>
        <Typography className='bigText'>4. Data Security</Typography>
        <Typography className='normalText'>
          We implement appropriate technical measures to protect your personal
          information. However, you acknowledge that no method of data
          transmission over the internet is 100% secure.
        </Typography>
      </Box>

      <Box>
        <Typography className='bigText'>5. Data Retention</Typography>
        <Typography className='normalText'>
          Your data is stored while your account is active.
        </Typography>
      </Box>

      <Box>
        <Typography className='bigText'>6. Cookies</Typography>
        <Typography className='normalText'>
          Cookies are used strictly for essential functionality such as session
          management and authentication. We do not use cookies for advertising
          or behavioral tracking.
        </Typography>
      </Box>

      <Box>
        <Typography className='bigText'>7. Your Rights</Typography>
        <Typography className='normalText'>
          You may request access to, correction, or deletion of your data by
          contacting us. You may also delete your account at any time. All
          associated data will be removed.
        </Typography>
      </Box>

      <Box>
        <Typography className='bigText'>8. Changes to This Policy</Typography>
        <Typography className='normalText'>
          We may update this privacy policy from time to time. We will notify
          you of any changes by posting the new policy on this page and updating
          the "Last updated" date. Your continued use of the website after such
          changes constitutes acceptance of the new policy.
        </Typography>
      </Box>

      <Box>
        <Typography className='bigText'>9. Contact</Typography>
        <Typography className='normalText'>
          For questions regarding the privacy policy, please contact us at:
        </Typography>
        <Typography className='normalText'> [example@email.com] </Typography>
      </Box>
    </Box>
  )
}

export default PrivacyPolicy
