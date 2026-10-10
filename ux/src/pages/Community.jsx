import { useCallback, useEffect, useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Alert, Box, Button, Card, CardActionArea, Collapse, IconButton, Link, Skeleton, Tab, Tabs, Typography,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import ChatBubbleOutlineRoundedIcon from '@mui/icons-material/ChatBubbleOutlineRounded';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import LocalFireDepartmentRoundedIcon from '@mui/icons-material/LocalFireDepartmentRounded';
import NewReleasesRoundedIcon from '@mui/icons-material/NewReleasesRounded';
import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded';
import VolunteerActivismRoundedIcon from '@mui/icons-material/VolunteerActivismRounded';
import ForumRoundedIcon from '@mui/icons-material/ForumRounded';
import { createForumPost, fetchForumFlairs, fetchForumPosts, voteForumPost } from '../api';
import VoteControl from '../components/community/VoteControl';
import AuthorChip from '../components/community/AuthorChip';
import FlairChip from '../components/community/FlairChip';
import PostComposerDialog from '../components/community/PostComposerDialog';
import LoginPromptDialog from '../components/community/LoginPromptDialog';
import useForumAuth from '../components/community/useForumAuth';

const SORTS = [
  { value: 'hot', label: 'Hot', icon: <LocalFireDepartmentRoundedIcon fontSize="small" /> },
  { value: 'new', label: 'New', icon: <NewReleasesRoundedIcon fontSize="small" /> },
  { value: 'top', label: 'Top', icon: <EmojiEventsRoundedIcon fontSize="small" /> },
];

const HOUSE_RULES = [
  ['Keep it clean', 'No bad language — this is a calm corner of the internet.'],
  ['Critique ideas, not people', 'Disagree kindly. Never insult or belittle another member.'],
  ['No scams or referral spam', 'No get-rich-quick schemes, affiliate links or self-promotion.'],
  ['Peer support, not professional advice', 'We’re here to share experience. For big decisions, talk to a qualified professional.'],
];

function HouseRules() {
  const theme = useTheme();
  const b = theme.palette.brand;
  const [open, setOpen] = useState(false);
  return (
    <Card variant="outlined" sx={{ borderColor: b.line, bgcolor: b.surface, borderRadius: 4 }}>
      <Box
        component="button"
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        sx={{
          all: 'unset', boxSizing: 'border-box', cursor: 'pointer', width: '100%',
          display: 'flex', alignItems: 'center', gap: 1.25, px: 2, py: 1.25,
          '&:focus-visible': { outline: `2px solid ${b.teal}`, outlineOffset: -2, borderRadius: 4 },
        }}
      >
        <VolunteerActivismRoundedIcon sx={{ color: b.coral }} fontSize="small" />
        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: b.ink, flex: 1 }}>House rules</Typography>
        <ExpandMoreRoundedIcon
          sx={{ color: b.inkSoft, transition: 'transform 200ms', transform: open ? 'rotate(180deg)' : 'none' }}
        />
      </Box>
      <Collapse in={open}>
        <Box component="ol" sx={{ m: 0, px: 2, pb: 2, pt: 0, pl: 4.5, display: 'flex', flexDirection: 'column', gap: 0.75 }}>
          {HOUSE_RULES.map(([title, text]) => (
            <Typography component="li" variant="body2" key={title} sx={{ color: b.inkSoft }}>
              <Box component="span" sx={{ fontWeight: 700, color: b.ink }}>{title}.</Box> {text}
            </Typography>
          ))}
        </Box>
      </Collapse>
    </Card>
  );
}

function PostCard({ item, canVote, onVote, isMe }) {
  const theme = useTheme();
  const b = theme.palette.brand;
  const navigate = useNavigate();
  const { post, myVote } = item;
  const to = `/community/${encodeURIComponent(post.id)}`;

  return (
    <Card
      variant="outlined"
      sx={{
        display: 'flex',
        borderColor: b.line,
        borderRadius: 4,
        bgcolor: 'background.paper',
        transition: 'border-color 150ms, box-shadow 150ms',
        '&:hover': { borderColor: alpha(b.teal, 0.5), boxShadow: `0 4px 18px ${alpha(b.ink, 0.06)}` },
      }}
    >
      <Box sx={{ py: 1, px: 0.5, bgcolor: alpha(b.surface, 0.6), borderRight: `1px solid ${b.line}` }}>
        <VoteControl
          key={`${post.id}:${post.score}:${myVote}`}
          score={post.score}
          myVote={myVote}
          canVote={canVote}
          onVote={(dir) => onVote(post.id, dir)}
        />
      </Box>
      <CardActionArea
        component="div"
        onClick={() => navigate(to)}
        sx={{ flex: 1, minWidth: 0, p: 2, display: 'flex', flexDirection: 'column', alignItems: 'stretch', gap: 1 }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
          {post.flair && <FlairChip flair={post.flair} />}
        </Box>
        <Link
          component={RouterLink}
          to={to}
          underline="hover"
          onClick={(e) => e.stopPropagation()}
          sx={{ color: b.ink, fontFamily: theme.typography.h5.fontFamily, fontWeight: 600, fontSize: '1.12rem', lineHeight: 1.3, wordBreak: 'break-word' }}
        >
          {post.title}
        </Link>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1.5, flexWrap: 'wrap' }}>
          <AuthorChip author={post.author} createdAt={post.createdAt} size={36} isMe={isMe} />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: b.inkSoft }}>
            <ChatBubbleOutlineRoundedIcon sx={{ fontSize: 18 }} />
            <Typography variant="body2">
              {post.commentCount} {post.commentCount === 1 ? 'comment' : 'comments'}
            </Typography>
          </Box>
        </Box>
      </CardActionArea>
    </Card>
  );
}

function PostSkeleton() {
  const theme = useTheme();
  const b = theme.palette.brand;
  return (
    <Card variant="outlined" sx={{ display: 'flex', borderColor: b.line, borderRadius: 4 }}>
      <Box sx={{ width: 48, p: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
        <Skeleton variant="circular" width={24} height={24} />
        <Skeleton width={18} />
        <Skeleton variant="circular" width={24} height={24} />
      </Box>
      <Box sx={{ flex: 1, p: 2 }}>
        <Skeleton variant="rounded" width={90} height={22} sx={{ borderRadius: 999 }} />
        <Skeleton width="80%" height={30} />
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Skeleton variant="circular" width={36} height={36} />
          <Skeleton width={120} />
        </Box>
      </Box>
    </Card>
  );
}

function EmptyState({ flair, onNewPost }) {
  const theme = useTheme();
  const b = theme.palette.brand;
  return (
    <Box sx={{ textAlign: 'center', py: 6, px: 2, border: `1px dashed ${b.line}`, borderRadius: 4, bgcolor: alpha(b.surface, 0.5) }}>
      <ForumRoundedIcon sx={{ fontSize: 44, color: b.teal, opacity: 0.8 }} />
      <Typography variant="h5" sx={{ mt: 1 }}>
        {flair ? `Nothing in “${flair}” yet` : 'It’s quiet in here'}
      </Typography>
      <Typography variant="body2" sx={{ color: b.inkSoft, mt: 0.5, mb: 2 }}>
        Be the first to ask a question or share a small win. Someone out there is wondering the same thing.
      </Typography>
      <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={onNewPost}>Start a post</Button>
    </Box>
  );
}

export default function Community() {
  const theme = useTheme();
  const b = theme.palette.brand;
  const navigate = useNavigate();
  const auth = useForumAuth();
  const { getToken, requireAuth, myUserId, authLoading } = auth;

  const [sort, setSort] = useState('hot');
  const [flair, setFlair] = useState(null);
  const [flairs, setFlairs] = useState([]);
  const [items, setItems] = useState(null);
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [composerOpen, setComposerOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchForumFlairs()
      .then((f) => { if (!cancelled) setFlairs(Array.isArray(f) ? f : []); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (authLoading) return undefined;
    let cancelled = false;
    setItems(null);
    setError(null);
    (async () => {
      try {
        const token = await getToken();
        const data = await fetchForumPosts(sort, flair, token);
        if (!cancelled) setItems(Array.isArray(data) ? data : []);
      } catch {
        if (!cancelled) {
          setItems([]);
          setError('We couldn’t load the conversation just now. Give it another try in a moment.');
        }
      }
    })();
    return () => { cancelled = true; };
  }, [sort, flair, getToken, authLoading, reloadKey]);

  const vote = useCallback(async (postId, dir) => {
    const token = await getToken();
    return voteForumPost(postId, dir, token);
  }, [getToken]);

  const openComposer = () => {
    if (requireAuth()) setComposerOpen(true);
  };

  const submitPost = async (draft) => {
    const token = await getToken();
    const created = await createForumPost(draft, token);
    setComposerOpen(false);
    if (created?.id) navigate(`/community/${encodeURIComponent(created.id)}`);
    else setReloadKey((k) => k + 1);
  };

  return (
    <Box sx={{ flex: 1, overflowY: 'auto', minWidth: 0, bgcolor: 'background.default' }}>
      <Box sx={{ maxWidth: 820, mx: 'auto', px: { xs: 2, sm: 3 }, py: { xs: 3, sm: 4 }, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        <Box sx={{ display: 'flex', alignItems: { xs: 'flex-start', sm: 'flex-end' }, justifyContent: 'space-between', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
          <Box>
            <Typography variant="h2" component="h1" sx={{ color: b.ink }}>Community</Typography>
            <Typography variant="body1" sx={{ color: b.inkSoft, mt: 0.5 }}>
              Ask anything about money. Share wins. Be kind.
            </Typography>
          </Box>
          <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={openComposer} sx={{ flexShrink: 0 }}>
            New post
          </Button>
        </Box>

        <HouseRules />

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
          <Tabs
            value={sort}
            onChange={(_, v) => setSort(v)}
            aria-label="Sort posts"
            sx={{
              minHeight: 40,
              borderBottom: `1px solid ${b.line}`,
              '& .MuiTab-root': { minHeight: 40, color: b.inkSoft, fontWeight: 600 },
              '& .Mui-selected': { color: `${b.teal} !important` },
              '& .MuiTabs-indicator': { bgcolor: b.teal, height: 3, borderRadius: 3 },
            }}
          >
            {SORTS.map((s) => (
              <Tab key={s.value} value={s.value} label={s.label} icon={s.icon} iconPosition="start" />
            ))}
          </Tabs>
          <Box
            role="toolbar"
            aria-label="Filter by topic"
            sx={{
              display: 'flex', gap: 1, overflowX: 'auto', flexWrap: 'nowrap', pb: 0.5,
              scrollbarWidth: 'thin',
              maskImage: 'linear-gradient(to right, black calc(100% - 24px), transparent)',
            }}
          >
            <FlairChip flair={null} selected={flair == null} onClick={() => setFlair(null)} />
            {flairs.map((f) => (
              <FlairChip key={f} flair={f} selected={flair === f} onClick={() => setFlair(flair === f ? null : f)} />
            ))}
            <Box sx={{ flex: '0 0 16px' }} />
          </Box>
        </Box>

        {error && (
          <Alert
            severity="info"
            action={<Button color="inherit" size="small" onClick={() => setReloadKey((k) => k + 1)}>Retry</Button>}
          >
            {error}
          </Alert>
        )}

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {items == null
            ? [0, 1, 2, 3].map((i) => <PostSkeleton key={i} />)
            : items.length === 0 && !error
              ? <EmptyState flair={flair} onNewPost={openComposer} />
              : items.map((item) => (
                <PostCard
                  key={item.post.id}
                  item={item}
                  canVote={requireAuth}
                  onVote={vote}
                  isMe={!!myUserId && item.post.author?.userId === myUserId}
                />
              ))}
        </Box>
      </Box>

      <PostComposerDialog
        open={composerOpen}
        onClose={() => setComposerOpen(false)}
        flairs={flairs}
        defaultFlair={flair || undefined}
        onSubmit={submitPost}
      />
      <LoginPromptDialog open={auth.loginPromptOpen} onClose={auth.closeLoginPrompt} onLogin={auth.login} />
    </Box>
  );
}
