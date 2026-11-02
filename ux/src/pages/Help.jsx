import { Box, Divider, Link, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

const Section = ({ title, children }) => (
  <>
    <Typography variant="h6" sx={{ mb: 1 }}>{title}</Typography>
    <Typography component="div" variant="body2" sx={{ mb: 3, '& p': { mt: 0, mb: 1 } }}>{children}</Typography>
    <Divider sx={{ mb: 3 }} />
  </>
);

const Help = () => (
  <Box sx={{ p: 3, maxWidth: 680, height: '100%', overflowY: 'auto' }}>
    <Typography variant="h4" component="h1" sx={{ mb: 3 }}>How LeisurePlan works</Typography>

    <Section title="Chat with your money coach">
      <p>Just type like you'd text a friend who's good with money. Ask about budgeting, emergency funds,
        student loans, credit cards, your credit score, rent, saving for a trip, investing basics, or that
        anxious "am I behind?" feeling. No judgment, ever.</p>
      <p>Not sure where to start?{' '}
        <Link href="/help/SampleQueries.html" target="_blank" rel="noopener noreferrer">Browse sample questions</Link>.</p>
    </Section>

    <Section title="See your money month by month">
      <p>Share what you earn (before tax, if you know it), what you spend each month and what you've saved,
        and LeisurePlan maps your cash flow forward — charts of money in and out, and how your savings grow.
        Ask "what if" questions any time: a raise, a pricier apartment, a big trip.</p>
    </Section>

    <Section title="Your portrait & wins">
      <p>Design a full-length portrait in the style of Renaissance Florence, Venice, Flanders or Tudor England,
        or Ming China, Edo Japan, Mughal India or Joseon Korea — just by chatting with the painter in the{' '}
        <Link component={RouterLink} to="/portrait">portrait studio</Link>.</p>
      <p>When you tell the coach about a sensible move you've made — starting an emergency fund, paying off a
        card, capturing your 401(k) match — it's recognised as a <strong>win</strong> and a symbolic keepsake
        (a shield, a laurel crown, keys, an hourglass…) appears in your portrait.</p>
    </Section>

    <Section title="Community">
      <p>The <Link component={RouterLink} to="/community">community</Link> is where members ask questions,
        share wins and swap tips. Upvote what helps. Keep it kind: no bad language and no insulting other
        members — critique ideas, not people. Posts are checked automatically before they appear.</p>
    </Section>

    <Section title="Past chats">
      <p>Your conversations are saved. Open <strong>Past chats</strong> from the menu to reload, rename or delete them,
        or choose <strong>New chat</strong> to start fresh.</p>
    </Section>

    <Typography variant="h6" sx={{ mb: 1 }}>How the projections are calculated</Typography>
    <Typography variant="body2">
      <Link href="/help/Inflation.html" target="_blank" rel="noopener noreferrer">Inflation</Link>
      {' · '}
      <Link href="/help/MarketROR.html" target="_blank" rel="noopener noreferrer">Investment growth</Link>
      {' · '}
      <Link href="/help/SocialSecurity.html" target="_blank" rel="noopener noreferrer">Social Security</Link>
    </Typography>
  </Box>
);

export default Help;
