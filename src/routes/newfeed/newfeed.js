const express = require('express')
const validator = require('validator')
const router = express.Router()
const { authenticateToken } = require('../../controllers/auth/auth')

const NewFeed = require('../../models/newfeed/newfeed')
const {
  showDataNewfeed,
  updateReaction,
  checkTypeReaction,
} = require('../../controllers/newfeed/newfeed')

router.post('/newfeed', authenticateToken, async (req, res) => {
  const requestData = req.body
  const newFeed = new NewFeed({
    type: requestData.type,
    caption: requestData.caption,
    media: requestData.media || [],
    tags: requestData.tags || [],
    comments: [],
    reactions: {
      total: 0,
      data: [
        { count: 0, type: 'LIKE' },
        { count: 0, type: 'LOVE' },
        { count: 0, type: 'WOW' },
        { count: 0, type: 'HAHA' },
        { count: 0, type: 'SAD' },
        { count: 0, type: 'ANGRY' },
      ],
    },
    userCreatePost: req.response.username,
  })

  try {
    const result = await newFeed.save()
    const data = await showDataNewfeed([result])

    res.json({
      success: true,
      response: {
        data: data[0],
      },
    })
  } catch (err) {
    console.log(err)
  }
})

router.get('/newfeed/:id', authenticateToken, async (req, res) => {
  try {
    const targetNewFeed = await NewFeed.findOne({ _id: req.params.id })
    if (targetNewFeed) {
      const data = await showDataNewfeed([targetNewFeed])
      res.json({
        success: true,
        response: {
          data: data[0],
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

router.get('/newfeeds', authenticateToken, async (req, res) => {
  const panigate = {
    page: Number(req.query.page) - 1 || 0,
    perPage: Number(req.query.perPage) || 10,
  }
  try {
    const targetNewFeeds = await NewFeed.find()
      .limit(panigate.perPage)
      .skip(panigate.perPage * panigate.page)
    const data = await showDataNewfeed(targetNewFeeds)
    const count = await NewFeed.countDocuments()

    res.json({
      success: true,
      response: {
        total: count,
        data,
      },
    })
  } catch (err) {
    console.log(err)
  }
})

router.get('/newfeeds/user/:username', async (req, res) => {
  const targetUser = req.params.username
  const panigate = {
    page: Number(req.query.page) - 1 || 0,
    perPage: Number(req.query.perPage) || 10,
  }
  try {
    const targetNewFeed = await NewFeed.find({ userCreatePost: targetUser })
      .limit(panigate.perPage)
      .skip(panigate.perPage * panigate.page)
    const data = await showDataNewfeed(targetNewFeed)
    const count = await NewFeed.countDocuments({ userCreatePost: targetUser })

    res.json({
      success: true,
      response: {
        total: count,
        data,
      },
    })
  } catch (err) {
    console.log(err)
  }
})

router.put(
  '/newfeed/reaction/:id',
  authenticateToken,
  checkTypeReaction,
  async (req, res) => {
    const reaction = {
      type: req.body.type,
      isReacted: req.body.isReacted,
    }

    try {
      const targetNewFeed = await NewFeed.findOne({ _id: req.params.id })
      if (targetNewFeed) {
        const targetNewFeedReaction = targetNewFeed.reactions.data
        const newReaction = updateReaction(reaction, targetNewFeedReaction)

        await NewFeed.findOneAndUpdate(
          { _id: req.params.id },
          { reactions: newReaction }
        )
        res.json({
          success: true,
          response: {},
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
  }
)

module.exports = router
