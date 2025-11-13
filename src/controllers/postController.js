import { Router } from 'express'
import { requireAuth } from '../middleware/auth.js'
import { createPost, listPosts, likePost, updatePost, deletePost } from '../services/postService.js'

const router = Router()

router.post('/', requireAuth, async (req, res) => {
  const { content } = req.body || {}
  if (!content || !String(content).trim()) return res.status(400).json({ error: 'INVALID_INPUT' })
  const post = await createPost(req.user.id, String(content))
  return res.status(201).json(post)
})

router.get('/', requireAuth, async (req, res) => {
  const limit = Number(req.query.limit || 10)
  const cursor = req.query.cursor || null
  const result = await listPosts(limit, cursor)
  return res.json(result)
})

router.post('/:id/like', requireAuth, async (req, res) => {
  const postId = Number(req.params.id)
  if (!Number.isInteger(postId) || postId <= 0) return res.status(400).json({ error: 'INVALID_POST_ID' })
  const likes = await likePost(req.user.id, postId)
  return res.status(201).json(likes)
})

router.put('/:id', requireAuth, async (req, res) => {
  const postId = Number(req.params.id)
  const { content } = req.body || {}
  if (!Number.isInteger(postId) || postId <= 0) return res.status(400).json({ error: 'INVALID_POST_ID' })
  if (!content || !String(content).trim()) return res.status(400).json({ error: 'INVALID_INPUT' })
  const post = await updatePost(req.user.id, postId, String(content))
  if (!post) return res.status(404).json({ error: 'NOT_FOUND_OR_NOT_OWNER' })
  return res.json(post)
})

router.delete('/:id', requireAuth, async (req, res) => {
  const postId = Number(req.params.id)
  if (!Number.isInteger(postId) || postId <= 0) return res.status(400).json({ error: 'INVALID_POST_ID' })
  const ok = await deletePost(req.user.id, postId)
  if (!ok) return res.status(404).json({ error: 'NOT_FOUND_OR_NOT_OWNER' })
  return res.status(204).end()
})

export default router