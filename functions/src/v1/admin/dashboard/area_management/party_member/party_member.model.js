const mongoose = require("mongoose");

const activityLogSchema = new mongoose.Schema(
  {
    is_alived: {
      type: Boolean,
      required: true,
      default: true,
    },

    firstname: {
      type: String,
      required: true,
    },

    lastname: {
      type: String,
      required: true,
    },

    matual_status: {
      type: String,
      required: false,
      default: null,
    },

    role_in_party_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MasterData_RoleInParty",
      required: false,
      default: null,
    },

    contact: {
      type: String,
      required: false,
      default: null,
    },

    family_system_number: {
      type: String,
      required: false,
      default: null,
    },

    sex: {
      type: String,
      required: false,
      default: null,
    },

    dob: {
      type: {
        day: Number,
        month: Number,
        year: Number,
      },
      required: false,
      default: null,
    },

    date_joined_party: {
      type: {
        day: Number,
        month: Number,
        year: Number,
      },
      required: false,
      default: null,
    },

    id_card_number: {
      type: String,
      required: false,
      default: null,
    },

    is_have_party_card_member: {
      type: Boolean,
      required: false,
      default: false,
    },

    party_leader: {
      type: Number,
      required: false,
      default: null,
    },

    party_sub_leader: {
      type: Number,
      required: false,
      default: null,
    },

    family_number: {
      type: String,
      required: false,
      default: null,
    },

    education_type_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MasterData_EducationType",
      required: false,
      default: null,
    },

    education_level_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MasterData_EducationLevel",
      required: false,
    },

    job_type_id: {
      type: Array,
      required: false,
    },

    job_name_id: {
      type: Array,
      required: false,
    },

    office_election_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MasterData_OfficeElection",
      required: false,
      default: null,
    },

    province_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MasterData_Area_Province",
      required: true,
    },

    district_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MasterData_Area_District",
      required: true,
    },

    commune_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MasterData_Area_Commues",
      required: true,
    },

    village_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MasterData_Area_Village",
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

module.exports = mongoose.model(
  "AreaMagnagement_PartyPeople",
  activityLogSchema
);
