const baseRoute = "app/area-management/party-member";
const mongoose = require("mongoose");
const modelPeople = require("../../../admin/dashboard/area_management/party_member/party_member.model");

const {
  post,
  getByID,
  getAll,
  update,
  remove,
  getPagination,
} = require("../../../../util/request/crud");

const route = (prop) => {
  // **************** Declaration ****************
  const urlAPI = `/${prop.main_route}/${baseRoute}`;

  prop.app.get(
    `${urlAPI}`,
    prop.api_auth,
    prop.jwt_auth,
    prop.request_user,
    async (req, res) => {
      const { province_id, district_id, commune_id, village_id } = req.query;

      // Build dynamic match filter
      let matchFilter = {};

      if (province_id) {
        if (!mongoose.Types.ObjectId.isValid(province_id)) {
          return res.status(400).json({
            success: false,
            message: "Invalid province_id!",
          });
        }
        matchFilter["province_id"] = new mongoose.Types.ObjectId(province_id);
      }

      if (district_id) {
        if (!mongoose.Types.ObjectId.isValid(district_id)) {
          return res.status(400).json({
            success: false,
            message: "Invalid district_id!",
          });
        }
        matchFilter["district_id"] = new mongoose.Types.ObjectId(district_id);
      }

      if (commune_id) {
        if (!mongoose.Types.ObjectId.isValid(commune_id)) {
          return res.status(400).json({
            success: false,
            message: "Invalid commune_id!",
          });
        }
        matchFilter["commune_id"] = new mongoose.Types.ObjectId(commune_id);
      }

      if (village_id) {
        if (!mongoose.Types.ObjectId.isValid(village_id)) {
          return res.status(400).json({
            success: false,
            message: "Invalid village_id!",
          });
        }
        matchFilter["village_id"] = new mongoose.Types.ObjectId(village_id);
      }

      // Male and female counts
      const resultMale = await modelPeople.aggregate([
        { $match: { ...matchFilter, sex: "male" } },
      ]);

      const resultFemale = await modelPeople.aggregate([
        { $match: { ...matchFilter, sex: "female" } },
      ]);

      const today = new Date();

      const aggregationResult = await modelPeople.aggregate([
        { $match: matchFilter }, // apply province filter if provided
        {
          $addFields: {
            dobDate: {
              $dateFromParts: {
                year: "$dob.year",
                month: "$dob.month",
                day: "$dob.day",
              },
            },
          },
        },
        {
          $addFields: {
            age: {
              $dateDiff: {
                startDate: "$dobDate",
                endDate: today,
                unit: "year",
              },
            },
          },
        },
        {
          $group: {
            _id: {
              sex: "$sex",
              ageGroup: {
                $switch: {
                  branches: [
                    { case: { $lte: ["$age", 18] }, then: "under_18" },
                    {
                      case: {
                        $and: [{ $gt: ["$age", 18] }, { $lte: ["$age", 35] }],
                      },
                      then: "up_18_to_35",
                    },
                  ],
                  default: "up_35",
                },
              },
            },
            count: { $sum: 1 },
          },
        },
      ]);

      // Initialize response structure
      const responseData = {
        success: true,
        total: {
          male: resultMale.length,
          female: resultFemale.length,
          count: resultMale.length + resultFemale.length,
        },
        age: {
          under_18: { male: 0, female: 0, count: 0 },
          up_18_to_35: { male: 0, female: 0, count: 0 },
          up_35: { male: 0, female: 0, count: 0 },
        },
      };

      // Fill in the age groups

      for (const record of aggregationResult) {
        const sex = record._id.sex;
        const ageGroup = record._id.ageGroup;
        const count = record.count;

        responseData.age[ageGroup][sex] += count;
        responseData.age[ageGroup].count += count;
      }

      const countFamilySet = new Set();
      [...resultFemale, ...resultMale].forEach((row) => {
        countFamilySet.add(row.family_system_number);
      });
      const countFamily = Array.from(countFamilySet);
      responseData.family_count = countFamily.length;

      res.json(responseData);
    }
  );
};

module.exports = route;
