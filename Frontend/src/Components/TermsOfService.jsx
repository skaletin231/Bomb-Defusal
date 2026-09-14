import { Box, Divider, Typography } from '@mui/material'

const TermsSX = {
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

const TermsOfService = () => {
  return (
    <Box className='termsOfService flexColumn content' sx={TermsSX}>
      <Box>
        <Typography className='mainHeader'>Terms of Service</Typography>
        <Typography sx={{ color: '#808080', fontStyle: 'italic' }}>
          {' '}
          Last updated: 9/14/2026{' '}
        </Typography>
      </Box>

      <Divider />

      <Box>
        <Typography className='bigText'>1. Acceptance of Terms</Typography>
        <Typography className='normalText'>
          By accessing and using Defuser, you agree to be bound by these Terms
          of Service. If you do not agree, please do not use our services.
        </Typography>
      </Box>

      <Box>
        <Typography className='bigText'>2. Website Information</Typography>
        <Typography className='normalText'>
          This website, Defuser, accessible at [url], is an online platform that
          allows users to play a collaborative two-player card-guessing game
          using user-generated decks.
        </Typography>
      </Box>

      <Box>
        <Typography className='bigText'>3. User Accounts</Typography>
        <Typography className='normalText'>
          To access certain features, including created decks and saved decks,
          you may be required to create an account. By creating an account, you
          agree to:
        </Typography>
        <ul
          style={{
            fontSize: '1.2rem',
            color: 'black',
            fontFamily: '"reddit sans", serif',
            margin: '0px',
          }}
        >
          <li>Provide accurate and complete information</li>
          <li>Maintain the security of your login credentials</li>
          <li>Accept responsibility for all activities under your account.</li>
        </ul>
      </Box>

      <Box>
        <Typography className='bigText'>4. Intellectual Property</Typography>
        <Typography className='normalText'>
          All content of this website, including text, graphics, and source
          code, is owned by its creators and is protected by intellectual
          property laws.
        </Typography>
      </Box>

      <Box>
        <Typography className='bigText'>5. User-Generated Content</Typography>
        <Typography className='normalText'>
          This website allows users to create, store, and share their own game
          content in the form of decks of cards. We reserve the right, at any
          time and without notice, to delete, refuse to publish, restrict access
          to, edit, or modify any User Content for any reason, including for
          legal, operational, content moderation, quality, or security reasons.
          By creating User Content, you agree that:
        </Typography>
        <ul
          style={{
            fontSize: '1.2rem',
            color: 'black',
            fontFamily: '"reddit sans", serif',
            margin: '0px',
          }}
        >
          <li>
            Your User Content does not violate any laws or infringe upon any
            third-party rights
          </li>
          <li>
            Your User Content is not defamatory, unlawful, abusive, or otherwise
            objectionable.
          </li>
        </ul>
      </Box>

      <Box>
        <Typography className='bigText'>6. Acceptable Use</Typography>
        <Typography className='normalText'>You agree not to:</Typography>
        <ul
          style={{
            fontSize: '1.2rem',
            color: 'black',
            fontFamily: '"reddit sans", serif',
            margin: '0px',
          }}
        >
          <li>Use this website for unlawful purposes</li>
          <li>Attempt unauthorized access to systems or accounts</li>
          <li>Interfere with the website's operation, servers, or networks</li>
          <li>Harass other users on the website.</li>
        </ul>
      </Box>

      <Box>
        <Typography className='bigText'>7. Service Availability</Typography>
        <Typography className='normalText'>
          We do not guarantee that the website will be available at all times or
          that it will be error-free. We reserve the right to modify, suspend,
          or discontinue any part of the website at any time without notice.
        </Typography>
      </Box>

      <Box>
        <Typography className='bigText'>8. Limitation of Liability</Typography>
        <Typography className='normalText'>
          To the maximum extent permitted by law, we shall not be liable for any
          indirect, incidental, special, consequential, or punitive damages, or
          any loss of profits or revenues, whether incurred directly or
          indirectly, or any loss of data, use, goodwill, or other intangible
          losses.
        </Typography>
      </Box>

      <Box>
        <Typography className='bigText'>9. Termination</Typography>
        <Typography className='normalText'>
          We reserve the right to suspend or terminate your account or access at
          any time, without prior notice, if you violate these Terms or for
          operational, legal, or security reasons.
        </Typography>
      </Box>

      <Box>
        <Typography className='bigText'>10. Changes to Terms</Typography>
        <Typography className='normalText'>
          We reserve the right to modify these Terms at any time. We will notify
          users of any material changes by posting the new Terms on this page
          and updating the "Last updated" date. Your continued use of the
          website after such changes constitutes acceptance of the new Terms.
        </Typography>
      </Box>

      <Box>
        <Typography className='bigText'>11. Governing Law</Typography>
        <Typography className='normalText'>
          These Terms shall be governed by and interpreted in accordance with
          the laws of the United States of America, without regard to conflict
          of law principles.
        </Typography>
      </Box>

      <Box>
        <Typography className='bigText'>12. Contact</Typography>
        <Typography className='normalText'>
          For questions regarding these Terms, please contact us at:
          [example@email.com]
        </Typography>
      </Box>
    </Box>
  )
}

export default TermsOfService
