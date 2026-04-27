import { Box, Divider, Link, Typography } from '@mui/material';

const Help = () => {
  return (
    <Box sx={{ p: 3, maxWidth: 640 }}>
      <Typography variant="h5" sx={{ mb: 3 }}>Help</Typography>

      <Typography variant="h6" sx={{ mb: 1 }}>Getting Started</Typography>
      <Typography variant="body2" sx={{ mb: 3 }}>
        LeisurePlan.App uses a conversational interface. Simply type a question or
        instruction in the chat box and the assistant will guide you through building
        your retirement plan.
      </Typography>

      <Divider sx={{ my: 3 }} />

      <Typography variant="h6" sx={{ mb: 1 }}>Sessions</Typography>
      <Typography variant="body2" sx={{ mb: 3 }}>
        Your conversations are saved as sessions. Use the <strong>Sessions</strong> menu
        item to view, reload, rename, or delete past sessions.
      </Typography>

      <Divider sx={{ my: 3 }} />

      <Typography variant="h6" sx={{ mb: 1 }}>Starting a New Chat</Typography>
      <Typography variant="body2" sx={{ mb: 3 }}>
        Select <strong>New Chat</strong> from the menu at any time to start a fresh
        session without losing your previous ones.
      </Typography>

      <Divider sx={{ my: 3 }} />

      <Typography variant="h6" sx={{ mb: 1 }}>Results</Typography>
      <Typography variant="body2">
        Charts and tables appear in the results panel on the right. You can drag the
        divider between the chat and results panels to resize them.
      </Typography>

      <Divider sx={{ my: 3 }} />

      <Typography variant="h6" sx={{ mb: 2 }}>Calculator Details</Typography>
      <Typography variant="body2">
        <Link href="/help/Inflation.html" target="_blank" rel="noopener noreferrer">
          How Inflation Works
        </Link>
      </Typography>
      <Typography variant="body2">
        <Link href="/help/MarketROR.html" target="_blank" rel="noopener noreferrer">
          How Market Rate of Return Works
        </Link>
      </Typography>
      <Typography variant="body2">
        <Link href="/help/SocialSecurity.html" target="_blank" rel="noopener noreferrer">
          How Social Security Works
        </Link>
      </Typography>
    </Box>
  );
};

export default Help;
