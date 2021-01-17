const User = require('../../models/user/user')

const showDataNewfeed = async (targetNewFeeds) => {
  const data = []
  await Promise.all(
    targetNewFeeds.map(async (item) => {
      const targetUserPost = await User.findOne({
        username: item.userCreatePost,
      })

      if (targetUserPost) {
        const reactions = []
        const comments = []
        const tags = []
        const medias = []

        item.reactions.data.map((reaction) =>
          reactions.push({
            count: reaction.count,
            type: reaction.type,
          })
        )

        data.push({
          id: item._id,
          type: item.type,
          caption: item.caption,
          medias,
          reactions: {
            total: item.reactions.total,
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
  let total = 0
  const data = oldReaction
  const typeReaction = targetTypeReaction(newReactionData.type)
  if (newReactionData.isReacted) {
    data[typeReaction].count -= 1
    if (data[typeReaction].count < 0) data[typeReaction].count = 0
  } else {
    data[typeReaction].count += 1
  }

  data.map((item, index) => (total += item.count))

  return {
    total,
    data,
  }
}

module.exports = { showDataNewfeed, updateReaction, checkTypeReaction }
