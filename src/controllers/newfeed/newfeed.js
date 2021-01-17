const User = require('../../models/user/user')

const showDataReaction = async (dataReaction) => {
  const reactions = []
  await Promise.all(
    dataReaction.data.map(async (reaction) => {
      const targetUserReaction = await User.findOne({
        username: reaction.username,
      })

      reactions.push({
        type: reaction.type,
        username: targetUserReaction.username,
        avatar: targetUserReaction.avatar || null,
      })
    })
  )
  return reactions
}

const showCommentData = async (dataComments) => {
  const comments = []
  await Promise.all(
    dataComments.map(async (comment) => {
      comments.push({
        caption: comment.caption,
        id: comment._id,
        media: comment.media,
        userCreateComment: comment.userCreateComment,
        createdAt: comment.createdAt,
      })
    })
  )
  return comments
}

const showDataNewfeed = async (targetNewFeeds) => {
  const data = []
  await Promise.all(
    targetNewFeeds.map(async (item) => {
      const targetUserPost = await User.findOne({
        username: item.userCreatePost,
      })

      if (targetUserPost) {
        const reactions = await showDataReaction(item.reactions)
        const comments = await showCommentData(item.comments)
        const tags = []
        const medias = []

        data.push({
          id: item._id,
          type: item.type,
          caption: item.caption,
          medias,
          reactions: {
            total: item.reactions.totals,
            data: reactions,
          },
          comments,
          tags,
          createdAt: item.createdAt,
          userCreatePost: {
            username: targetUserPost.username,
            avatar: targetUserPost.avatar || null,
          },
        })
      }
    })
  )
  return data
}

const targetTypeReaction = (type) => {
  switch (type) {
    case 'LIKE':
      return 0
    case 'LOVE':
      return 1
    case 'WOW':
      return 2
    case 'HAHA':
      return 3
    case 'SAD':
      return 4
    case 'ANGRY':
      return 5
    default:
      return ''
  }
}

const checkTypeReaction = (req, res, next) => {
  const typeReaction = targetTypeReaction(req.body.type)
  if (typeof typeReaction !== 'number') {
    return res.json({
      success: false,
      message: 'Type Reaction không hợp lệ',
    })
  }
  next()
}

const updateReaction = (newReactionData, oldReaction) => {
  const data = oldReaction.data
  const totals = {
    likes: 0,
    loves: 0,
    wows: 0,
    hahas: 0,
    sads: 0,
    angrys: 0,
    totalReactions: 0,
  }
  const isExisted = { status: '', index: -1 }

  data.map((item, index) => {
    if (
      item.username === newReactionData.username &&
      item.type !== newReactionData.type
    ) {
      isExisted.status = 'CHANGE'
      isExisted.index = index
    } else if (
      item.username === newReactionData.username &&
      item.type === newReactionData.type
    ) {
      isExisted.status = 'EXISTED'
      isExisted.index = index
    }
  })

  const newReaction = {
    type: newReactionData.type,
    username: newReactionData.username,
  }

  if (isExisted.status === 'CHANGE') {
    data[isExisted.index] = newReaction
  } else if (isExisted.status === 'EXISTED') {
    data.splice(isExisted.index, 1)
  } else {
    data.push(newReaction)
  }

  data.map((item) => {
    if (item.type === 'LIKE') totals.likes += 1
    if (item.type === 'LOVE') totals.loves += 1
    if (item.type === 'WOW') totals.wows += 1
    if (item.type === 'HAHA') totals.hahas += 1
    if (item.type === 'SAD') totals.sads += 1
    if (item.type === 'ANGRY') totals.angrys += 1
    totals.totalReactions = data.length
  })

  return {
    data,
    totals,
  }
}

const createComment = async (commentData, commentsOld) => {
  const data = commentsOld
  const targetUserPost = await User.findOne({ username: commentData.username })
  const reactions = await showDataReaction({
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
  })

  data.push({
    caption: commentData.caption,
    media: commentData.media,
    reactions,
    userCreateComment: {
      username: targetUserPost.username,
      avatar: targetUserPost.avatar || null,
    },
  })

  return data
}

const updateComment = async (commentData, commentsOld) => {
  const data = commentsOld
  const commentTarget = {
    data: {},
    index: -1,
  }
  data.map((item, index) => {
    if (item.userCreateComment.username === commentData.username) {
      commentTarget.data = item
      commentTarget.index = index
    }
  })
  if (commentTarget.data.id) {
    data[commentTarget.index] = {
      userCreateComment: commentTarget.data.userCreateComment,
      createdAt: commentTarget.data.createdAt,
      caption: commentData.caption,
      media: commentData.media,
    }
    return data
  } else {
    return false
  }
}

module.exports = {
  showDataNewfeed,
  updateReaction,
  checkTypeReaction,
  createComment,
  updateComment,
}
