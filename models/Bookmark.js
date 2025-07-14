import mongoose from "mongoose"

const BookmarkSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    url: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    isFavorite: {
      type: Boolean,
      default: false,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  },
)

// Index for search functionality
BookmarkSchema.index({ title: "text", description: "text", url: "text" })
BookmarkSchema.index({ userId: 1, createdAt: -1 })

export default mongoose.models.Bookmark || mongoose.model("Bookmark", BookmarkSchema)
