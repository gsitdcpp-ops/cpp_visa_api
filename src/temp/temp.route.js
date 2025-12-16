const { userInfo } = require("./folder/user");
const mongoose = require("mongoose");
const modelPartPeople = require("./../v1/admin/dashboard/area_management/party_member/party_member.model");
const modelJobName = require("./../v1/admin/dashboard/master_data/job/job_name/job.model");
const modelEducationLevel = require("./../v1/admin/dashboard/master_data/education/education_level/education_level.model");

const index = (prop) => {
  const baseRoute = "/api/temporary";
  const urlAPI = `${baseRoute}`;

  // 🔹 Helper function — ensures only valid ObjectIds or null
  const toObjectIdOrNull = (id) =>
    id && mongoose.isValidObjectId(id) ? new mongoose.Types.ObjectId(id) : null;

  prop.app.get(`${urlAPI}`, async (req, res) => {
    try {
      // Load related data
      const [dataJobName, dataEducationLevel, data] = await Promise.all([
        modelJobName.find({}),
        modelEducationLevel.find({}),
        userInfo(),
      ]);

      const newDocs = [];

      for (let i = 0; i < data.length; i++) {
        const randomUser = data[i] || {};

        // 🧩 Find job_type_id based on job_name_id
        const job_type_id = [];
        if (Array.isArray(randomUser.job_name_id)) {
          dataJobName.forEach((row) => {
            if (
              randomUser.job_name_id[0] &&
              row._id.toString() === randomUser.job_name_id[0].toString()
            ) {
              job_type_id.push(toObjectIdOrNull(row.job_type_id));
            }
          });
        }

        // 🧩 Find education_type_id based on education_level_id
        let education_type_id = null;
        if (randomUser.education_level_id) {
          const eduRow = dataEducationLevel.find(
            (row) =>
              row._id.toString() === randomUser.education_level_id.toString()
          );
          if (eduRow)
            education_type_id = toObjectIdOrNull(eduRow.education_type_id);
        }

        // 🧩 Build each record safely
        newDocs.push({
          is_alived: true,
          firstname: randomUser.firstname,
          lastname: randomUser.lastname,
          matual_status: randomUser.matual_status,
          role_in_party_id: toObjectIdOrNull(randomUser.role_in_party_id),
          contact: randomUser.contact,
          family_system_number:
            randomUser.family_system_number?.toString() || "",
          sex: randomUser.sex,
          dob: randomUser.dob,
          date_joined_party: randomUser.date_joined_party,
          id_card_number: randomUser.id_card_number,
          is_have_party_card_member: randomUser.is_have_party_card_member,
          party_leader: randomUser.party_leader,
          party_sub_leader: randomUser.party_sub_leader,
          family_number: randomUser.family_number,

          // ✅ Safe ObjectId conversion
          office_election_id: toObjectIdOrNull(randomUser.office_election_id),
          job_name_id: Array.isArray(randomUser.job_name_id)
            ? randomUser.job_name_id.map((id) => toObjectIdOrNull(id))
            : [],
          job_type_id: job_type_id.filter(Boolean),
          education_level_id: toObjectIdOrNull(randomUser.education_level_id),
          education_type_id: toObjectIdOrNull(education_type_id),

          // Default area and user info (✅ safe ObjectIds)
          province_id: toObjectIdOrNull("690090c45a64a6af13b55dc7"),
          district_id: toObjectIdOrNull("690091885a64a6af13b55df4"),
          commune_id: toObjectIdOrNull("6900919d5a64a6af13b55e1d"),
          village_id: toObjectIdOrNull("690091b55a64a6af13b55e4e"),
          note: "យ៉ោងទៅតាមឯកសារដើម​​(Excel)",
          status: true,
          deleted: false,
          created_by: toObjectIdOrNull("6870db1b2c949b560e93bea8"),
          updated_by: toObjectIdOrNull("6870db1b2c949b560e93bea8"),
        });
      }

      // 🧩 Insert safely
      const insertedDocs = await modelPartPeople.insertMany(newDocs, {
        ordered: false, // continue even if one doc fails
      });

      res.status(201).json({
        success: true,
        message: `${insertedDocs.length} Party People inserted successfully!`,
        data: insertedDocs,
      });
    } catch (error) {
      console.error("❌ Error inserting PartyPeople:", error);
      res.status(500).json({
        success: false,
        message: "Error inserting data",
        error: error.message,
      });
    }
  });
};

module.exports = index;
