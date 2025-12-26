const mongoose = require("mongoose");

const activityLogSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    date_generated: {
      type: {
        day: Number,
        month: Number,
        year: Number,
        hour: Number,
        minute: Number,
        second: Number,
      },
      required: true,
      default: null,
    },

    date_expired: {
      type: {
        day: Number,
        month: Number,
        year: Number,
        hour: Number,
        minute: Number,
        second: Number,
      },
      required: true,
      default: null,
    },

    is_expired: {
      type: Boolean,
      required: true,
      default: false,
    },

    count: {
      type: Number,
      required: true,
    },

    // Defualt //
    note: {
      type: String,
      required: false,
    },
    status: {
      type: Boolean,
      default: true,
      required: false,
    },
    deleted: {
      type: Boolean,
      default: false,
      required: false,
    },
    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    updated_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: { createdAt: "created_date", updatedAt: "updated_date" },
  }
);

module.exports = mongoose.model("QRCodeAuthLogin", activityLogSchema);
