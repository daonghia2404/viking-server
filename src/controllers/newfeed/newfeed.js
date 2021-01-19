const User = require('../../models/user/user')
const {
  validateUrlImage,
  validateUrlVideo,
  validateUrlAudio,
  validateText,
} = require('../../utils/validation')

const showDataReaction = async (dataReaction, currentUser) => {
  const reactions = []
  let isUserReacted = {}
  await Promise.all(
    dataReaction.data.map(async (reaction) => {
      const targetUserReaction = await User.findOne({
        username: reaction.username,
      })

      if (currentUser === targetUserReaction.username)
        isUserReacted = {
          type: reaction.type,
          username: targetUserReaction.username,
        }

      reactions.push({
        type: reaction.type,
        username: targetUserReaction.username,
        avatar: targetUserReaction.avatar || null,
      })
    })
  )

  return {
    total: dataReaction.totals,
    data: reactions,
    isUserReacted,
  }
}

const showCommentData = async (dataComments, currentUser) => {
  const comments = []
  await Promise.all(
    dataComments.map(async (comment) => {
      const reactions = await showDataReaction(comment.reactions, currentUser)
      const medias = await showMediaData(comment.medias)
      comments.push({
        caption: comment.caption,
        id: comment._id,
        medias,
        reactions,
        userCreateComment: comment.userCreateComment,
        createdAt: comment.createdAt,
      })
    })
  )
  return comments
}

const showMediaData = async (dataMedias) => {
  const medias = []
  await Promise.all(
    dataMedias.map(async (media) => {
      medias.push({
        id: media._id,
        url: media.url,
        type: media.type,
        fileName: media.fileName,
      })
    })
  )
  return medias
}

const showDataNewfeed = async (targetNewFeeds, currentUser) => {
  const data = []
  await Promise.all(
    targetNewFeeds.map(async (item) => {
      const targetUserPost = await User.findOne({
        username: item.userCreatePost,
      })

      if (targetUserPost) {
        const reactions = await showDataReaction(item.reactions, currentUser)
        const comments = await showCommentData(item.comments, currentUser)
        const medias = await showMediaData(item.medias)

        data.push({
          id: item._id,
          type: item.type,
          caption: item.caption,
          medias: medias || [],
          reactions,
          comments,
          tags: item.tags,
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

  data.push({
    caption: commentData.caption,
    medias: commentData.medias,
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
    if (item._id.toString() === commentData.commentId) {
      commentTarget.data = item
      commentTarget.index = index
    }
  })
  if (commentTarget.data.id) {
    if (
      commentTarget.data.userCreateComment.username === commentData.username
    ) {
      data[commentTarget.index] = {
        userCreateComment: commentTarget.data.userCreateComment,
        createdAt: commentTarget.data.createdAt,
        reactions: commentTarget.data.reactions,
        caption: commentData.caption,
        medias: commentData.medias,
      }
      return data
    } else {
      return 'PERMISSION'
    }
  } else {
    return 'NOT_FOUND'
  }
}

const deleteComment = async (commentData, commentsOld, newfeed) => {
  const data = commentsOld
  const commentTarget = {
    data: {},
    index: -1,
  }
  data.map((item, index) => {
    if (item._id.toString() === commentData.commentId) {
      commentTarget.data = item
      commentTarget.index = index
    }
  })
  if (commentTarget.data.id) {
    if (
      commentTarget.data.userCreateComment.username === commentData.username ||
      newfeed.userCreatePost.username === commentData.username
    ) {
      data.splice(commentTarget.index, 1)
      return data
    } else {
      return 'PERMISSION'
    }
  } else {
    return 'NOT_FOUND'
  }
}

const reactionComment = async (newReactionData, oldComment) => {
  const data = oldComment
  const commentTarget = {
    data: {},
    index: -1,
  }
  data.map((item, index) => {
    if (item._id.toString() === newReactionData.commentId) {
      commentTarget.data = item
      commentTarget.index = index
    }
  })
  if (commentTarget.data.id) {
    const targetCommentReaction = commentTarget.data.reactions
    const newReaction = updateReaction(newReactionData, targetCommentReaction)
    data[commentTarget.index].reactions = newReaction
    return data
  } else {
    return 'NOT_FOUND'
  }
}

const checkTypeMedia = (req, res, next) => {
  const dataMedia = req.body.medias
  if (dataMedia.length !== 0) {
    let error = ''
    dataMedia.map((item) => {
      if (!validateText(item.fileName)) {
        error = 'Không có Filename'
      }
      if (!['IMAGE', 'VIDEO', 'AUDIO'].includes(item.type)) {
        error = 'Type không hợp lệ'
      }
      if (item.type === 'IMAGE' && !validateUrlImage(item.url)) {
        error = 'URL image không hợp lệ'
      }
      if (item.type === 'VIDEO' && !validateUrlVideo(item.url)) {
        error = 'URL video không hợp lệ'
      }
      if (item.type === 'AUDIO' && !validateUrlAudio(item.url)) {
        error = 'URL audio không hợp lệ'
      }
    })
    if (!error) next()
    else {
      res.json({
        success: false,
        message: error,
      })
    }
  } else {
    next()
  }
}

module.exports = {
  showDataNewfeed,
  updateReaction,
  checkTypeReaction,
  createComment,
  updateComment,
  deleteComment,
  reactionComment,
  checkTypeMedia,
}
