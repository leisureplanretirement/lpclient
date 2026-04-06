import { Box, Divider, Link, Typography } from '@mui/material';

const About = () => {
  return (
    <Box sx={{ p: 3, maxWidth: 640 }}>
      <Typography variant="h5" sx={{ mb: 3 }}>About LeisurePlan.App</Typography>

      <Typography variant="body1" sx={{ mb: 2 }}>
        LeisurePlan.App is a retirement planning calculator designed to help individuals
        model and explore their financial future. Using a conversational interface, users
        can simulate retirement scenarios, analyse cash flows, and review annual and
        monthly projections in detail.
      </Typography>

      <Typography variant="body1" sx={{ mb: 3 }}>
        Our goal is to make retirement planning approachable and interactive — giving you
        the tools to ask "what if" questions and understand the long-term impact of your
        financial decisions.
      </Typography>

      <Divider sx={{ my: 3 }} />

      <Typography variant="h6" sx={{ mb: 1 }}>Disclaimer</Typography>
      <Typography variant="body2" color="text.secondary">
        The information and calculations provided on this website are for educational
        purposes only and are not intended as financial, investment, tax, or legal advice.
        Individual circumstances vary, and you should consult with a qualified financial
        advisor, tax professional, or attorney before making any decisions based on the
        information provided.
      </Typography>

      <Divider sx={{ my: 3 }} />

      <Typography variant="h6" sx={{ mb: 1 }}>Legal</Typography>
      <Typography variant="body2">
        <Link href="/Legal/TermsOfUse.html" target="_blank" rel="noopener noreferrer">
          Terms of Use
        </Link>
      </Typography>

      <Divider sx={{ my: 3 }} />

      <Typography variant="h6" sx={{ mb: 1 }}>Contact & Feedback</Typography>
      <Typography variant="body2" sx={{ mb: 1 }}>
        To report issues or submit feedback, please visit our{' '}
        <Link href="https://github.com/leisureplanretirement/lpclient/issues" target="_blank" rel="noopener noreferrer">
          GitHub Issues
        </Link>{' '}
        page.
      </Typography>
      <Typography variant="body2">
        For support, contact us at{' '}
        <Link href="mailto:leisureplansupport@gmail.com">leisureplansupport@gmail.com</Link>.
      </Typography>
    </Box>
  );
};

export default About;
