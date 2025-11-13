import { query } from '../db.js'

export async function createPost(userId, content) {
  const res = await query(
    'INSERT INTO posts(user_id, content) VALUES($1,$2) RETURNING id, user_id, content, created_at',
    [userId, content]
  )
  return res.rows[0]
}

export async function listPosts(limit = 10, cursor) {
  let rows
  if (cursor) {
    const [cAt, cId] = Buffer.from(cursor, 'base64').toString('utf8').split('|')
    rows = (
      await query(
        'SELECT p.id, p.user_id, p.content, p.created_at, COALESCE(lc.count,0) AS likes\
         FROM posts p\
         LEFT JOIN (SELECT post_id, COUNT(*) AS count FROM likes GROUP BY post_id) lc ON lc.post_id=p.id\
         WHERE (p.created_at, p.id) < ($1, $2)\
         ORDER BY p.created_at DESC, p.id DESC\
         LIMIT $3',
        [cAt, Number(cId), Number(limit)]
      )
    ).rows
  } else {
    rows = (
      await query(
        'SELECT p.id, p.user_id, p.content, p.created_at, COALESCE(lc.count,0) AS likes\
         FROM posts p\
         LEFT JOIN (SELECT post_id, COUNT(*) AS count FROM likes GROUP BY post_id) lc ON lc.post_id=p.id\
         ORDER BY p.created_at DESC, p.id DESC\
         LIMIT $1',
        [Number(limit)]
      )
    ).rows
  }
  const last = rows[rows.length - 1]
  const nextCursor = last ? Buffer.from(`${last.created_at.toISOString()}|${last.id}`).toString('base64') : null
  return { items: rows, nextCursor }
}

export async function likePost(userId, postId) {
  await query('INSERT INTO likes(user_id, post_id) VALUES($1,$2) ON CONFLICT DO NOTHING', [userId, postId])
  const res = await query('SELECT COUNT(*)::int AS count FROM likes WHERE post_id=$1', [postId])
  return { likes: res.rows[0].count }
}

export async function updatePost(userId, postId, content) {
  const res = await query(
    'UPDATE posts SET content=$3 WHERE id=$2 AND user_id=$1 RETURNING id, user_id, content, created_at',
    [userId, postId, content]
  )
  return res.rows[0] || null
}

export async function deletePost(userId, postId) {
  const res = await query('DELETE FROM posts WHERE id=$2 AND user_id=$1 RETURNING id', [userId, postId])
  return res.rows[0] ? true : false
}