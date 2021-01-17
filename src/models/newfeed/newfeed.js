const mongoose = require('mongoose')

const reactionTypeSchema = new mongoose.Schema({
  count: {
    type: Number,
    required: true,
  },
  type: {
    type: String,
    enum: ['LIKE', 'LOVE', 'WOW', 'HAHA', 'SAD', 'ANGRY'],
    required: true,
  },
})

const ReactionSchema = new mongoose.Schema(
  {
    total: {
      type: Number,
      required: true,
    },
    data: [reactionTypeSchema],
  },
  { timestamps: true }
)

const CommentSchema = new mongoose.Schema(
  {
    userCreatePost: {
      type: String,
      required: true,
    },
    caption: {
      type: String,
      required: true,
    },
    reactions: {
      type: ReactionSchema,
      required: true,
    },
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
    reactions: {
      type: ReactionSchema,
      required: true,
    },
  },
  { timestamps: true }
)

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
      type: [String],
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
