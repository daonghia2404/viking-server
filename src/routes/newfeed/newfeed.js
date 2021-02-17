const express = require('express')
const validator = require('validator')
const router = express.Router()
const { authenticateToken } = require('../../controllers/auth/auth')

const NewFeed = require('../../models/newfeed/newfeed')
const {
  showDataNewfeed,
  updateReaction,
  createComment,
  updateComment,
  checkTypeReaction,
  deleteComment,
  reactionComment,
  checkTypeMedia,
} = require('../../controllers/newfeed/newfeed')

router.post('/newfeed', authenticateToken, checkTypeMedia, async (req, res) => {
  const requestData = req.body
  const newFeed = new NewFeed({
    type: requestData.type,
    caption: requestData.caption,
    medias: requestData.medias || [],
    tags: requestData.tags || [],
    comments: [],
    reactions: {
      totals: {
        likes: 0,
        loves: 0,
        wows: 0,
        hahas: 0,
        sads: 0,
        angrys: 0,
        totalReactions: 0,
      },
      data: [],
    },
    userCreatePost: req.response.username,
  })

  try {
    const result = await newFeed.save()
    const data = await showDataNewfeed([result], req.response.username)

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

router.put(
  '/newfeed/:id',
  authenticateToken,
  checkTypeMedia,
  async (req, res) => {
    const dataNewFeed = {
      caption: req.body.caption,
      medias: req.body.medias,
      tags: req.body.tags,
      username: req.response.username,
    }
    try {
      const targetNewFeed = await NewFeed.findOne({ _id: req.params.id })
      if (targetNewFeed) {
        if (targetNewFeed.userCreatePost === dataNewFeed.username) {
          await NewFeed.updateOne(
            { _id: req.params.id },
            {
              caption: dataNewFeed.caption,
              medias: dataNewFeed.medias,
              tags: dataNewFeed.tags,
            }
          )
          res.json({
            success: true,
            response: {},
          })
        } else {
          res.status(403).json({
            success: false,
            message: 'Không có quyền sửa bài viết này',
          })
        }
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

router.get('/newfeed/:id', authenticateToken, async (req, res) => {
  try {
    const targetNewFeed = await NewFeed.findOne({ _id: req.params.id })
    if (targetNewFeed) {
      const data = await showDataNewfeed([targetNewFeed], req.response.username)
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

router.delete('/newfeed/:id', authenticateToken, async (req, res) => {
  try {
    const targetNewFeed = await NewFeed.findOne({ _id: req.params.id })
    if (targetNewFeed) {
      if (targetNewFeed.userCreatePost === req.response.username) {
        await NewFeed.deleteOne({ _id: req.params.id })
        res.json({
          success: true,
          response: {},
        })
      } else {
        res.status(403).json({
          success: false,
          message: 'Không có quyền xóa bài viết này',
        })
      }
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
    const data = await showDataNewfeed(targetNewFeeds, req.response.username)
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
    const data = await showDataNewfeed(targetNewFeed, req.response.username)
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
  '/newfeed/:id/reaction',
  authenticateToken,
  checkTypeReaction,
  async (req, res) => {
    const reaction = {
      type: req.body.type,
      username: req.response.username,
    }

    try {
      const targetNewFeed = await NewFeed.findOne({ _id: req.params.id })
      if (targetNewFeed) {
        const targetNewFeedReaction = targetNewFeed.reactions
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

router.post(
  '/newfeed/:id/comment',
  authenticateToken,
  checkTypeMedia,
  async (req, res) => {
    const comment = {
      caption: req.body.caption,
      medias: req.body.medias || [],
      username: req.response.username,
    }

    try {
      const targetNewFeed = await NewFeed.findOne({ _id: req.params.id })
      if (targetNewFeed) {
        const targetNewFeedComments = targetNewFeed.comments
        const newComments = await createComment(comment, targetNewFeedComments)
        await NewFeed.findOneAndUpdate(
          { _id: req.params.id },
          { comments: newComments }
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

router.put(
  '/newfeed/:id/comment/:commentId',
  authenticateToken,
  checkTypeMedia,
  async (req, res) => {
    const comment = {
      caption: req.body.caption,
      medias: req.body.medias,
      username: req.response.username,
      commentId: req.params.commentId,
    }

    try {
      const targetNewFeed = await NewFeed.findOne({ _id: req.params.id })
      if (targetNewFeed) {
        const targetNewFeedComments = targetNewFeed.comments
        const newComments = await updateComment(comment, targetNewFeedComments)
        if (newComments === 'PERMISSION') {
          res.status(403).json({
            success: false,
            message: 'Không có quyền sửa bình luận này',
          })
        } else if (newComments === 'NOT_FOUND') {
          res.status(404).json({
            success: false,
            message: 'Không tìm thấy bình luận này',
          })
        } else {
          await NewFeed.findOneAndUpdate(
            { _id: req.params.id },
            { comments: newComments }
          )
          res.json({
            success: true,
            response: {},
          })
        }
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

router.delete(
  '/newfeed/:id/comment/:commentId',
  authenticateToken,
  async (req, res) => {
    const comment = {
      username: req.response.username,
      commentId: req.params.commentId,
    }
    try {
      const targetNewFeed = await NewFeed.findOne({ _id: req.params.id })
      if (targetNewFeed) {
        const targetNewFeedComments = targetNewFeed.comments
        const newComments = await deleteComment(
          comment,
          targetNewFeedComments,
          targetNewFeed
        )
        if (newComments === 'PERMISSION') {
          res.status(403).json({
            success: false,
            message: 'Không có quyền xóa bình luận này',
          })
        } else if (newComments === 'NOT_FOUND') {
          res.status(404).json({
            success: false,
            message: 'Không tìm thấy bình luận này',
          })
        } else {
          await NewFeed.findOneAndUpdate(
            { _id: req.params.id },
            { comments: newComments }
          )
          res.json({
            success: true,
            response: {},
          })
        }
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

router.put(
  '/newfeed/:id/comment/:commentId/reaction',
  authenticateToken,
  checkTypeReaction,
  async (req, res) => {
    const reaction = {
      type: req.body.type,
      commentId: req.params.commentId,
      username: req.response.username,
    }
    try {
      const targetNewFeed = await NewFeed.findOne({ _id: req.params.id })
      if (targetNewFeed) {
        const targetNewFeedComments = targetNewFeed.comments
        const newComments = await reactionComment(
          reaction,
          targetNewFeedComments
        )
        if (newComments === 'NOT_FOUND') {
          return res.status(404).json({
            success: false,
            message: 'Không tìm thấy bình luận này',
          })
        } else {
          await NewFeed.findOneAndUpdate(
            { _id: req.params.id },
            { comments: newComments }
          )
          res.json({
            success: true,
            response: {},
          })
        }
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
