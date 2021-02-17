const mongoose = require('mongoose')

const reactionTypeSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['LIKE', 'LOVE', 'WOW', 'HAHA', 'SAD', 'ANGRY'],
    required: true,
  },
  username: {
    type: String,
    ref: 'User',
    required: true,
  },
  avatar: {
    type: String,
    ref: 'User',
    required: true,
  },
})

const ReactionSchema = new mongoose.Schema(
  {
    totals: {
      likes: {
        type: Number,
        required: true,
      },
      loves: {
        type: Number,
        required: true,
      },
      wows: {
        type: Number,
        required: true,
      },
      hahas: {
        type: Number,
        required: true,
      },
      sads: {
        type: Number,
        required: true,
      },
      angrys: {
        type: Number,
        required: true,
      },
      totalReactions: {
        type: Number,
        required: true,
      },
    },
    data: [reactionTypeSchema],
  },
  { timestamps: true }
)

const MediaSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['IMAGE', 'VIDEO', 'AUDIO'],
      required: true,
    },
    fileName: {
      type: String,
      required: true,
    },
    // reactions: {
    //   type: ReactionSchema,
    // },
  },
  { timestamps: true }
)

const CommentSchema = new mongoose.Schema(
  {
    userCreateComment: {
      username: {
        type: String,
        ref: 'User',
        required: true,
      },
      avatar: {
        type: String,
        ref: 'User',
        required: true,
      },
    },
    caption: {
      type: String,
      required: true,
    },
    medias: {
      type: [MediaSchema],
      required: true,
    },
    reactions: {
      type: ReactionSchema,
      required: true,
    },
  },
  { timestamps: true }
)

const TagSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
})

const NewFeedSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['NORMAL', 'POLL', 'SHARED'],
      default: 'NORMAL',
      required: true,
    },
    caption: {
      type: String,
    },
    medias: {
      type: [MediaSchema],
      required: true,
    },
    reactions: {
      type: ReactionSchema,
      required: true,
    },
    comments: {
      type: [CommentSchema],
      required: true,
    },
    tags: {
      type: [TagSchema],
      required: true,
    },
    userCreatePost: {
      type: String,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
)

const NewFeed = mongoose.model('NewFeed', NewFeedSchema)

module.exports = NewFeed
