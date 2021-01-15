const express = require('express')
const validator = require('validator')
const router = express.Router()
const { authenticateToken } = require('../../controllers/auth/auth')

const NewFeed = require('../../models/newfeed/newfeed')
const User = require('../../models/user/user')

router.post('/newfeed', authenticateToken, async (req, res) => {
  const requestData = req.body
  const newFeed = new NewFeed({
    type: requestData.type,
    caption: requestData.caption,
    media: [],
    reactions: [
      { count: 0, type: 'LIKE' },
      { count: 0, type: 'LOVE' },
      { count: 0, type: 'WOW' },
      { count: 0, type: 'HAHA' },
      { count: 0, type: 'SAD' },
      { count: 0, type: 'ANGRY' },
    ],
    tags: [],
    comments: [],
    userCreatePost: req.response.id,
  })

  try {
    const result = await newFeed.save()
    res.json({
      success: true,
      response: result,
    })
  } catch (err) {
    console.log(err)
  }
})

router.get('/newfeed/:id', authenticateToken, async (req, res) => {
  try {
    const targetNewFeed = await NewFeed.findOne({ _id: req.params.id })
    if (targetNewFeed) {
      const targetUserPost = await User.findOne({
        _id: targetNewFeed.userCreatePost,
      })
      res.json({
        success: true,
        response: {
          id: targetNewFeed._id,
          type: targetNewFeed.type,
          caption: targetNewFeed.caption,
          media: targetNewFeed.media,
          reactions: targetNewFeed.reactions,
          comments: targetNewFeed.comments,
          tags: targetNewFeed.tags,
          createdAt: targetNewFeed.createdAt,
          userCreatePost: {
            id: targetUserPost._id,
            username: targetUserPost.username,
            avatar: targetUserPost.avatar,
          },
        },
      })
    } else {
      res.status(404).json({
        success: false,
        message: 'Không tìm thấy bài viết này',
      })
    }
  } catch (err) {
    console.log(err)
  }
})

module.exports = router
