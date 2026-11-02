import { useCallback, useEffect, useState } from 'react';
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom';
import { Alert, Box, Button, Card, Link, Skeleton, Typography } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import ReplyRoundedIcon from '@mui/icons-material/ReplyRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import ChatBubbleOutlineRoundedIcon from '@mui/icons-material/ChatBubbleOutlineRounded';
import {
  createForumComment, deleteForumComment, deleteForumPost, fetchForumThread, voteForumComment, voteForumPost,
} from '../api';
import VoteControl from '../components/community/VoteControl';
import AuthorChip from '../components/community/AuthorChip';
import FlairChip from '../components/community/FlairChip';
import CommentComposer from '../components/community/CommentComposer';
import LoginPromptDialog from '../components/community/LoginPromptDialog';
import ConfirmDeleteDialog from '../components/community/ConfirmDeleteDialog';
import useForumAuth from '../components/community/useForumAuth';

// Beyond this depth replies keep stacking at the same indentation so narrow screens stay readable.
const MAX_INDENT = 6;
const REMOVED = '[removed]';

function countComments(nodes) {
  return (nodes || []).reduce((n, c) => n + 1 + countComments(c.replies), 0);
}

function RemovedText({ children = 'This was removed.' }) {
  const theme = useTheme();
  return (
    <Typography variant="body2" sx={{ color: theme.palette.brand.inkSoft, fontStyle: 'italic', opacity: 0.75 }}>
      {children}
    </Typography>
  );
}

function CommentNode({ node, depth, ctx }) {
  const theme = useTheme();
  const b = theme.palette.brand;
  const { comment, myVote, replies = [] } = node;
  const [replying, setReplying] = useState(false);
  const removed = comment.deleted || comment.body === REMOVED;
  const mine = !removed && !!ctx.myUserId && comment.author?.userId === ctx.myUserId;
  const indent = depth < MAX_INDENT;

  const startReply = () => {
    if (ctx.requireAuth()) setReplying(true);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75, py: 0.5 }}>
        {removed ? (
          <RemovedText>[removed]</RemovedText>
        ) : (
          <>
            <AuthorChip author={comment.author} createdAt={comment.createdAt} size={32} isMe={mine} />
            <Typography
              variant="body2"
              component="div"
              sx={{ color: b.ink, whiteSpace: 'pre-wrap', wordBreak: 'break-word', lineHeight: 1.6 }}
            >
              {comment.body}
            </Typography>
          </>
        )}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexWrap: 'wrap', ml: -0.75 }}>
          <VoteControl
            key={`${comment.id}:${comment.score}:${myVote}`}
            orientation="horizontal"
            size="small"
            score={comment.score}
            myVote={myVote}
            disabled={removed}
            canVote={ctx.requireAuth}
            onVote={(dir) => ctx.voteComment(comment.id, dir)}
          />
          {!removed && (
            <Button size="small" color="inherit" startIcon={<ReplyRoundedIcon />} onClick={startReply} sx={{ color: b.inkSoft }}>
              Reply
            </Button>
          )}
          {mine && (
            <Button
              size="small"
              color="inherit"
              startIcon={<DeleteOutlineRoundedIcon />}
              onClick={() => ctx.askDelete({ kind: 'comment', id: comment.id })}
              sx={{ color: b.inkSoft }}
            >
              Delete
            </Button>
          )}
        </Box>
        {replying && (
          <Box sx={{ pl: 1 }}>
            <CommentComposer
              autoFocus
              placeholder={`Reply to ${comment.author?.handle || 'this member'}…`}
              submitLabel="Reply"
              onCancel={() => setReplying(false)}
              onSubmit={async (body) => {
                await ctx.addComment(body, comment.id);
                setReplying(false);
              }}
            />
          </Box>
        )}
      </Box>
      {replies.length > 0 && (
        <Box
          sx={indent ? {
            ml: 1.25,
            pl: { xs: 1.25, sm: 2 },
            borderLeft: `2px solid ${b.line}`,
            '&:hover': { borderLeftColor: alpha(b.teal, 0.45) },
          } : undefined}
        >
          {replies.map((r) => (
            <CommentNode key={r.comment.id} node={r} depth={depth + 1} ctx={ctx} />
          ))}
        </Box>
      )}
    </Box>
  );
}

function ThreadSkeleton() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Skeleton variant="rounded" width={100} height={22} sx={{ borderRadius: 999 }} />
      <Skeleton width="85%" height={40} />
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Skeleton variant="circular" width={44} height={44} />
        <Skeleton width={140} />
      </Box>
      <Skeleton variant="rounded" height={140} />
      <Skeleton variant="rounded" height={70} />
      <Skeleton variant="rounded" height={70} sx={{ ml: 3 }} />
    </Box>
  );
}

export default function CommunityThread() {
  const { postId } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const b = theme.palette.brand;
  const auth = useForumAuth();
  const { getToken, requireAuth, myUserId, authLoading } = auth;

  const [thread, setThread] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  const refetch = useCallback(() => setReloadKey((k) => k + 1), []);

  useEffect(() => {
    if (authLoading) return undefined;
    let cancelled = false;
    setLoadError(null);
    (async () => {
      try {
        const token = await getToken();
        const data = await fetchForumThread(postId, token);
        if (!cancelled) setThread(data);
      } catch {
        if (!cancelled) setLoadError('We couldn’t open this conversation. It may have been removed, or the connection hiccuped.');
      }
    })();
    return () => { cancelled = true; };
  }, [postId, getToken, authLoading, reloadKey]);

  const voteComment = useCallback(async (commentId, dir) => {
    const token = await getToken();
    return voteForumComment(postId, commentId, dir, token);
  }, [getToken, postId]);

  const addComment = useCallback(async (body, parentCommentId) => {
    const token = await getToken();
    await createForumComment(postId, body, parentCommentId, token);
    refetch();
  }, [getToken, postId, refetch]);

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      const token = await getToken();
      if (pendingDelete.kind === 'post') {
        await deleteForumPost(postId, token);
        setPendingDelete(null);
        navigate('/community');
        return;
      }
      await deleteForumComment(postId, pendingDelete.id, token);
      setPendingDelete(null);
      refetch();
    } catch {
      setPendingDelete(null);
      setDeleteError('That didn’t delete — please try again in a moment.');
    } finally {
      setDeleting(false);
    }
  };

  const ctx = { myUserId, requireAuth, voteComment, addComment, askDelete: setPendingDelete };
  const post = thread?.post;
  const comments = thread?.comments || [];
  const postRemoved = !!post?.deleted;
  const postMine = !!post && !postRemoved && !!myUserId && post.author?.userId === myUserId;
  const total = countComments(comments);

  return (
    <Box sx={{ flex: 1, overflowY: 'auto', minWidth: 0, bgcolor: 'background.default' }}>
      <Box sx={{ maxWidth: 820, mx: 'auto', px: { xs: 2, sm: 3 }, py: { xs: 2, sm: 3 }, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        <Link
          component={RouterLink}
          to="/community"
          underline="hover"
          sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, color: b.teal, fontWeight: 600, alignSelf: 'flex-start' }}
        >
          <ArrowBackRoundedIcon fontSize="small" /> Back to Community
        </Link>

        {loadError && !thread && (
          <Alert
            severity="info"
            action={<Button color="inherit" size="small" onClick={refetch}>Retry</Button>}
          >
            {loadError}
          </Alert>
        )}
        {deleteError && <Alert severity="info" onClose={() => setDeleteError(null)}>{deleteError}</Alert>}

        {!thread && !loadError && <ThreadSkeleton />}

        {post && (
          <Card variant="outlined" sx={{ display: 'flex', borderColor: b.line, borderRadius: 4, bgcolor: 'background.paper' }}>
            <Box sx={{ py: 1.5, px: 0.5, bgcolor: alpha(b.surface, 0.6), borderRight: `1px solid ${b.line}` }}>
              <VoteControl
                key={`${post.id}:${post.score}:${thread.myVote}`}
                score={post.score}
                myVote={thread.myVote}
                disabled={postRemoved}
                canVote={requireAuth}
                onVote={async (dir) => voteForumPost(post.id, dir, await getToken())}
              />
            </Box>
            <Box sx={{ flex: 1, minWidth: 0, p: { xs: 2, sm: 2.5 }, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {post.flair && <Box><FlairChip flair={post.flair} /></Box>}
              <Typography variant="h3" component="h1" sx={{ color: b.ink, wordBreak: 'break-word' }}>
                {post.title}
              </Typography>
              {!postRemoved && <AuthorChip author={post.author} createdAt={post.createdAt} size={44} isMe={postMine} />}
              {postRemoved ? (
                <RemovedText>This post was removed.</RemovedText>
              ) : (
                <Typography
                  component="div"
                  variant="body1"
                  sx={{ color: b.ink, whiteSpace: 'pre-wrap', wordBreak: 'break-word', lineHeight: 1.7 }}
                >
                  {post.body}
                </Typography>
              )}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: b.inkSoft, flexWrap: 'wrap' }}>
                <ChatBubbleOutlineRoundedIcon sx={{ fontSize: 18 }} />
                <Typography variant="body2">{total} {total === 1 ? 'comment' : 'comments'}</Typography>
                <Box sx={{ flex: 1 }} />
                {postMine && (
                  <Button
                    size="small"
                    color="inherit"
                    startIcon={<DeleteOutlineRoundedIcon />}
                    onClick={() => setPendingDelete({ kind: 'post' })}
                    sx={{ color: b.inkSoft }}
                  >
                    Delete post
                  </Button>
                )}
              </Box>
            </Box>
          </Card>
        )}

        {post && !postRemoved && (
          <Box>
            {auth.isAuthenticated ? (
              <CommentComposer
                placeholder="Add a kind, thoughtful comment…"
                onSubmit={(body) => addComment(body, null)}
              />
            ) : (
              <Box
                sx={{
                  display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap',
                  p: 1.5, borderRadius: 3, border: `1px dashed ${b.line}`, bgcolor: alpha(b.surface, 0.5),
                }}
              >
                <Typography variant="body2" sx={{ color: b.inkSoft, flex: 1 }}>
                  Log in to join the conversation.
                </Typography>
                <Button size="small" variant="contained" onClick={auth.login}>Log in</Button>
              </Box>
            )}
          </Box>
        )}

        {post && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {comments.length === 0 ? (
              <Typography variant="body2" sx={{ color: b.inkSoft, textAlign: 'center', py: 3 }}>
                No comments yet — be the first to offer a kind word or a helpful idea.
              </Typography>
            ) : (
              comments.map((n) => <CommentNode key={n.comment.id} node={n} depth={0} ctx={ctx} />)
            )}
          </Box>
        )}
      </Box>

      <ConfirmDeleteDialog
        open={!!pendingDelete}
        what={pendingDelete?.kind === 'comment' ? 'comment' : 'post'}
        busy={deleting}
        onCancel={() => setPendingDelete(null)}
        onConfirm={confirmDelete}
      />
      <LoginPromptDialog open={auth.loginPromptOpen} onClose={auth.closeLoginPrompt} onLogin={auth.login} />
    </Box>
  );
}
