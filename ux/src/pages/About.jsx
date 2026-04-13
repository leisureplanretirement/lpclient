import { Box, Divider, Link, Typography } from '@mui/material';

const About = () => {
  return (
    <Box sx={{ p: 3, maxWidth: 640, overflowY: 'auto', height: '100%' }}>
	<Typography variant="h5" sx={{ mb: 3 }}>
	    About LeisurePlan.App
	</Typography>

	<Typography variant="body1" sx={{ mb: 2 }}>
	    LeisurePlan.App is an interactive retirement planning platform that helps you understand,
	    model, and take control of your financial future. Instead of static spreadsheets or
	    one-size-fits-all calculators, LeisurePlan uses a conversational interface to explore
	    personalized retirement scenarios in a simple and intuitive way.
	</Typography>

	<Typography variant="body1" sx={{ mb: 3 }}>
	    You can simulate "what if" decisions, analyze cash flows over time, and examine detailed
	    annual and monthly projections to see how your choices play out across your lifetime.
	    Our mission is to make retirement planning clear, engaging, and actionable; empowering
	    you to make informed decisions with confidence and adapt your plan as your life evolves.
	</Typography>

	<Typography variant="h6" sx={{ mb: 2 }}>
	    Our Story
	</Typography>

	<Typography variant="body1" sx={{ mb: 3 }}>
	    LeisurePlan.App was created out of a practical frustration. Traditional spreadsheets
	    quickly become unwieldy when modeling real retirement scenarios; multiple income streams,
	    taxes, investment growth, uncertainty, and changing life decisions all interact in complex
	    ways. At the same time, many existing web-based calculators provide only simplified
	    projections and often act as lead generators for financial advisory services rather than
	    tools for deep, independent exploration. LeisurePlan.App was built to bridge this gap;
	    combining the flexibility of advanced modeling with an interface designed for exploration,
	    not sales pressure.
	</Typography>

	<Typography variant="h6" sx={{ mb: 2 }}>
	    Leadership
	</Typography>

	<Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
	    <Box
		component="img"
		src="/images/anthony_tomasic.jpg"
		alt="Anthony Tomasic"
		sx={{ width: 100, height: 100, borderRadius: "50%", mr: 2, objectFit: 'cover' }}
	    />
	    <Typography variant="subtitle1">
		Anthony Tomasic, PhD, MBA — CEO
	    </Typography>
	</Box>

	<Typography variant="body1" sx={{ mb: 3 }}>
	    Anthony Tomasic is the CEO of LeisurePlan.App and a computer scientist with extensive
	    experience in artificial intelligence, data systems, and product development. He has
	    spent over two decades at Carnegie Mellon University, where he helped found leading
	    graduate programs in data science and product management. His work focuses on translating
	    complex models into intuitive, user-centered systems that enable better decision-making.
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
