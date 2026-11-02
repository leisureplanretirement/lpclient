import { Box, Divider, Link, Typography } from '@mui/material';

const About = () => {
  return (
    <Box sx={{ p: 3, maxWidth: 640, overflowY: 'auto', height: '100%' }}>
	<Typography variant="h4" component="h1" sx={{ mb: 3 }}>
	    About LeisurePlan
	</Typography>

	<Typography variant="body1" sx={{ mb: 2 }}>
	    LeisurePlan is a money app for your twenties that cares less about squeezing out every last
	    dollar and more about how you feel: confident that nothing seriously bad is going to happen,
	    proud of the sensible choices you make, and free to spend on the trips, hobbies and friends
	    that make life good.
	</Typography>

	<Typography variant="body1" sx={{ mb: 3 }}>
	    It's not extreme frugality and it's not get-rich-quick. It's a steady middle path: a solid
	    safety net first, then room for fun. You chat with a judgment-free money coach, see your
	    cash flow mapped out month by month, design a Renaissance-style portrait that gathers
	    keepsakes as you make prudent moves, and learn alongside others in the community.
	</Typography>

	<Typography variant="h6" sx={{ mb: 2 }}>
	    Our Story
	</Typography>

	<Typography variant="body1" sx={{ mb: 3 }}>
	    LeisurePlan began as a detailed planning engine built out of frustration with spreadsheets
	    and with online calculators that are really lead generators for advisers. The same engine —
	    month-by-month cash flows, taxes, inflation and investment growth — now powers a friendlier
	    experience for people just getting started, built for exploration, not sales pressure.
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
