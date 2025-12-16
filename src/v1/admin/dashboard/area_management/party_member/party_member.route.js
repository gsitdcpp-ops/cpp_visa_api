const baseRoute = "area-management/party-member";
const mongoose = require("mongoose");
const model = require("./party_member.model");
const modelVillage = require("../../master_data/area_pin/villages/villages.model");
const modelCommue = require("../../master_data/area_pin/commues/commues.model");
const modelDistrict = require("../../master_data/area_pin/disctrict/district.model");
const modelProvince = require("../../master_data/area_pin/province/province.model");
const modelEducation_level = require("../../master_data/education/education_level/education_level.model");
const modelJobName = require("../../master_data/job/job_name/job.model");
const modelJobType = require("../../master_data/job/job_type/job_type.model");
const modelRoleInParty = require("../../master_data/role_in_party/role_in_party.model");
const modelElectionOffice = require("../../master_data/office_election/office_election.model");
const modelCount = require("../../master_data/party/count/count.model");

const {
  post,
  getByID,
  getAll,
  update,
  remove,
  getPagination,
} = require("../../../../../util/request/crud");

const route = (prop) => {
  // **************** Declaration ****************
  const urlAPI = `/${prop.main_route}/${baseRoute}`;
  const tital_Toast = "គ្រប់គ្រងតំបន់ - ប្រជាពលរដ្ឋ";
  const requestRequired = [
    { key: "firstname", label: "នាម (firstname)" },
    { key: "lastname", label: "ក្តោនាម (lastname)" },
    {
      key: "family_system_number",
      label: "លេខកូដគ្រួសារ (family_system_number)",
    },
    {
      key: "sex",
      label: "ភេទ (sex)",
    },

    {
      key: "dob",
      label: "ថ្ងៃខែឆ្នាំកំណើត (dob)",
    },

    {
      key: "date_joined_party",
      label: "ថ្ងៃចូលបក្ស (date_joined_party)",
    },

    {
      key: "party_leader",
      label: "ក្រុមបក្សទី (party_leader)",
    },

    {
      key: "party_sub_leader",
      label: "អនុសាខាទី (party_sub_leader)",
    },

    {
      key: "education_level_id",
      label: "កម្រិតវប្បធម៌ (education_level_id)",
    },

    {
      key: "job_name_id",
      label: "ការងារ (job_name_id)",
    },

    {
      key: "village_id",
      label: "ក្រុម/ឃុំ (village_id)",
    },
  ];

  prop.app.post(
    `${urlAPI}`,
    prop.api_auth,
    prop.jwt_auth,
    prop.request_user,

    async (req, res) => {
      var data = ({
        firstname,
        lastname,
        job_name_id,
        village_id,
        education_level_id,
        job_name_id,
        note,
        status,
      } = req.body);

      // Step 1 : Check Location <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
      // Check ID
      if (village_id) {
        if (!mongoose.Types.ObjectId.isValid(village_id)) {
          return res.status(400).json({
            success: false,
            message: "មិនមានទិន្នន័យក្រុម/ឃុំ!",
          });
        }
      }

      // Get CommuneId, DistrictId, ProvinceId
      var village = await modelVillage.findOne({ _id: village_id });

      if (!village) {
        return res.status(400).json({
          success: false,
          message: "មិនមានទិន្នន័យក្រុម/ឃុំ!", // No village data
        });
      }

      // Step 1: Find the commune
      var commune = await modelCommue.findOne({
        commues_id: village.village_data.commune_id,
      });

      if (!commune) {
        return res.status(400).json({
          success: false,
          message: "មិនមានទិន្នន័យឃុំ!", // No commune data
        });
      }

      // Step 2: Find the district
      var district = await modelDistrict.findOne({
        district_id: village.village_data.district_id,
      });

      if (!district) {
        return res.status(400).json({
          success: false,
          message: "មិនមានទិន្នន័យតំបន់!", // No district data
        });
      }

      // Step 3: Find the province
      var province = await modelProvince.findOne({
        province_id: village.village_data.province_id,
      });

      if (!province) {
        return res.status(400).json({
          success: false,
          message: "មិនមានទិន្នន័យក្រុង!", // No province data
        });
      }

      // Result
      data.province_id = province._id;
      data.district_id = district._id;
      data.commune_id = commune._id;
      data.village_id = village_id;

      // Step 2 : Check Eudcation Type and ID <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
      if (education_level_id) {
        if (!mongoose.Types.ObjectId.isValid(education_level_id)) {
          return res.status(400).json({
            success: false,
            message: "មិនមានទិន្នន័យកម្រិតវប្បធម៌!",
          });
        }
      }

      var education_level = await modelEducation_level
        .findOne({ _id: education_level_id })
        .populate("education_type_id");

      if (!education_level) {
        return res.status(400).json({
          success: false,
          message: "មិនមានទិន្នន័យកម្រិតវប្បធម៌!", // No education level data
        });
      }

      // Result
      data.education_level_id = education_level._id;
      data.education_type_id = education_level.education_type_id._id;

      // Step 3 :Job Type ID as Array [] <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
      var listData = [];
      var listOfType = [];
      if (Array.isArray(job_name_id) && job_name_id.length > 0) {
        for (let i = 0; i < job_name_id.length; i++) {
          if (!mongoose.Types.ObjectId.isValid(job_name_id[i])) {
            return res.status(400).json({
              success: false,
              message: "មិនមានទិន្នន័យការងារ!", // Invalid job ID
            });
          }
          listData.push(job_name_id[i]);
        }

        // Now fetch jobs by listData using $in
        const jobs = await modelJobName
          .find({
            _id: { $in: listData },
          })
          .populate("job_type_id");

        // Optional: Check if any jobs were found
        if (!jobs || jobs.length === 0) {
          return res.status(404).json({
            success: false,
            message: "រកមិនឃើញការងារទេ!", // No jobs found
          });
        }

        //------------------------------------------------
        // Find Type
        var listOfType = [];
        jobs.map((row, i) => {
          var isCanAdd = true;

          listOfType.map((item) => {
            if (item == row.job_type_id._id) {
              isCanAdd = false;
            }
          });

          if (isCanAdd) {
            listOfType.push(row.job_type_id._id);
          }
        });

        data.job_type_id = listOfType;
      } else {
        return res.status(400).json({
          success: false,
          message: "មិនមានទិន្នន័យការងារ", // No education level data
        });
      }

      var isUnfinishConnection = false;
      await post(
        res,
        req,
        requestRequired,
        data,
        model,
        tital_Toast,
        "NA",
        isUnfinishConnection
      );
    }
  );

  prop.app.get(
    `${urlAPI}/:id`, // optional ":id"
    prop.api_auth,
    prop.jwt_auth,
    prop.request_user,
    async (req, res) => {
      await getByID(res, req, model, false);
    }
  );

  prop.app.get(
    `${urlAPI}-with-family/:id`, // optional ":id"
    prop.api_auth,
    prop.jwt_auth,
    prop.request_user,
    async (req, res) => {
      await getByIDMember(res, req, model, false);
    }
  );

  async function getByIDMember(res, req, model, isDeleted) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: "ID is required!",
        });
      }

      // ✅ Validate ID
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: "មិនមានទិន្នន័យនៅក្នុងប្រព័ន្ធ!",
        });
      }

      const currentData = await model
        .findOne({
          _id: id,
          deleted: isDeleted,
        })
        .populate([
          "role_in_party_id",
          "village_id",
          "education_level_id",
          "education_type_id",
          "created_by",
        ]);

      if (!currentData) {
        return res.status(404).json({
          success: false,
          message: "មិនមានទិន្នន័យនៅក្នុងប្រព័ន្ធ!",
        });
      }

      // Get job names
      const jobName = await modelJobName.find({});
      const jobType = await modelJobType.find({});

      let job_data = [];
      let job_type_data = [];

      // Check if job_name_id exists and is an array
      if (currentData.job_name_id && Array.isArray(currentData.job_name_id)) {
        for (let i = 0; i < currentData.job_name_id.length; i++) {
          const jobId = currentData.job_name_id[i];

          if (mongoose.Types.ObjectId.isValid(jobId)) {
            const foundJob = jobName.find(
              (row) => row._id.toString() === jobId.toString()
            );

            if (foundJob) {
              job_data.push(foundJob);
            }
          }
        }
      }

      if (currentData.job_type_id && Array.isArray(currentData.job_type_id)) {
        for (let i = 0; i < currentData.job_type_id.length; i++) {
          const jobId = currentData.job_type_id[i];
          if (mongoose.Types.ObjectId.isValid(jobId)) {
            const foundJob = jobType.find(
              (row) => row._id.toString() === jobId.toString()
            );

            if (foundJob) {
              job_type_data.push(foundJob);
            }
          }
        }
      }

      var memberFamily = [];
      if (
        currentData.family_system_number == "".toString() ||
        currentData.family_system_number == null ||
        currentData.family_system_number == undefined
      ) {
        // skip - don't fetch family members
      } else {
        var filter = {
          village_id: currentData.village_id,
          family_system_number: currentData.family_system_number,
          _id: { $ne: currentData._id }, // Exclude the current member
        };
        memberFamily = await model.find(filter);
      }
      // Add job data to the unit object
      const result = {
        ...currentData.toObject(),
        job_data: job_data,
        job_type_data: job_type_data,
        member_family: memberFamily,
      };

      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (err) {
      console.error("Error in getByIDMember:", err);
      res.status(500).json({
        success: false,
        message: `មានបញ្ហាក្នុងប្រព័ន្ធសូមព្យាយាមម្តងទៀតពេលក្រោយ: ${err.message}`,
      });
    }
  }

  prop.app.get(
    `${urlAPI}-all`,
    prop.api_auth,
    prop.jwt_auth,
    prop.request_user,
    async (req, res) => {
      await getAll(res, req, model, false);
    }
  );

  prop.app.get(
    `${urlAPI}`,
    prop.api_auth,
    prop.jwt_auth,
    prop.request_user,
    async (req, res) => {
      let result = await getPagination(
        req.query,
        model,
        ["village_id", "role_in_party_id", "education_level_id"],
        []
      );
      res.json({ success: true, ...result });
    }
  );

  prop.app.get(
    `${urlAPI}-by-pin-area`,
    prop.api_auth,
    prop.jwt_auth,
    prop.request_user,
    async (req, res) => {
      const {
        province_id,
        district_id,
        commune_id,
        village_id,
        sex,
        matual_status,
        age_start,
        age_end,
        joined_year_start,
        joined_year_end,
        party_leader,
        party_sub_leader,
        role_in_party_id,
      } = req.query;

      if (!sex) {
        return res.status(400).send({
          success: false,
          message: "sex មិនត្រឹមត្រូវ! (all,male,female)",
        });
      }

      if (!matual_status) {
        return res.status(400).send({
          success: false,
          message: "matual_status មិនត្រឹមត្រូវ! (single,married,divorce)",
        });
      }

      // FIlter More
      if (!party_leader) {
        return res.status(400).send({
          success: false,
          message: "party_leader មិនត្រឹមត្រូវ!",
        });
      }

      if (!party_sub_leader) {
        return res.status(400).send({
          success: false,
          message: "party_sub_leader មិនត្រឹមត្រូវ!",
        });
      }

      if (!role_in_party_id) {
        return res.status(400).send({
          success: false,
          message: "role_in_party_id មិនត្រឹមត្រូវ!",
        });
      }

      const jobName = await modelJobName.find({});

      if (village_id) {
        if (!mongoose.Types.ObjectId.isValid(village_id)) {
          return res.status(400).send({
            success: false,
            message: "village_id មិនត្រឹមត្រូវ!",
          });
        }

        let result = await getPaginationPinArea(
          req.query,
          model,
          ["village_id", "education_level_id", "role_in_party_id"],
          [],
          sex,
          matual_status,
          age_start,
          age_end,
          joined_year_start,
          joined_year_end,
          "village_id",
          village_id,
          jobName,
          party_leader,
          party_sub_leader,
          role_in_party_id
        );
        return res.json({ success: true, ...result });
      }

      if (commune_id) {
        if (!mongoose.Types.ObjectId.isValid(commune_id)) {
          return res.status(400).send({
            success: false,
            message: "commune_id មិនត្រឹមត្រូវ!",
          });
        }
        let result = await getPaginationPinArea(
          req.query,
          model,
          ["village_id", "education_level_id", "role_in_party_id"],
          [],
          sex,
          matual_status,
          age_start,
          age_end,
          joined_year_start,
          joined_year_end,
          "commune_id",
          commune_id,
          jobName,
          party_leader,
          party_sub_leader,
          role_in_party_id
        );
        return res.json({ success: true, ...result });
      }

      if (district_id) {
        if (!mongoose.Types.ObjectId.isValid(district_id)) {
          return res.status(400).send({
            success: false,
            message: "district_id មិនត្រឹមត្រូវ!",
          });
        }
        let result = await getPaginationPinArea(
          req.query,
          model,
          ["village_id", "education_level_id", "role_in_party_id"],
          [],
          sex,
          matual_status,
          age_start,
          age_end,
          joined_year_start,
          joined_year_end,
          "district_id",
          district_id,
          jobName,
          party_leader,
          party_sub_leader,
          role_in_party_id
        );
        return res.json({ success: true, ...result });
      }

      if (province_id) {
        if (!mongoose.Types.ObjectId.isValid(province_id)) {
          return res.status(400).send({
            success: false,
            message: "province_id មិនត្រឹមត្រូវ!",
          });
        }
        let result = await getPaginationPinArea(
          req.query,
          model,
          ["village_id", "education_level_id", "role_in_party_id"],
          [],
          sex,
          matual_status,
          age_start,
          age_end,
          joined_year_start,
          joined_year_end,
          "province_id",
          province_id,
          jobName,
          party_leader,
          party_sub_leader,
          role_in_party_id
        );
        return res.json({ success: true, ...result });
      }

      return res.status(400).send({
        success: false,
        message:
          "មិនមិនមានទិនន្នន័យទីតាំង! (province_id,district_id,commune_id,village_id)",
      });
    }
  );

  async function getPaginationPinArea(
    query,
    Model,
    populate = [],
    additionalFilter = [],
    sex,
    matual_status,
    age_start,
    age_end,
    joined_year_start,
    joined_year_end,
    pin_area_name,
    pin_area_id,
    jobName,
    party_leader,
    party_sub_leader,
    role_in_party_id
  ) {
    // --- Pagination ---
    const page = parseInt(query.page, 10) || 1;
    const limit = parseInt(query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    // --- Sorting ---
    const sortField = query.sort || "created_date";
    const sortOrder = query.order === "asc" ? 1 : -1;

    // --- Soft delete toggle ---
    const includeDeleted = query.includeDeleted === "true";
    const deleteFilter = includeDeleted ? {} : { deleted: false };

    // --- Special filter (sex + pin area + marital status) ---
    const specialFilter = {
      [pin_area_name]: new mongoose.Types.ObjectId(pin_area_id),
    };

    if (sex && sex.toLowerCase() !== "all") {
      specialFilter.sex = { $regex: `^${sex}$`, $options: "i" };
    }

    if (matual_status && matual_status.toLowerCase() !== "all") {
      specialFilter.matual_status = {
        $regex: `^${matual_status}$`,
        $options: "i",
      };
    }

    // // --- Age filter using dob ---
    if (age_start && age_end) {
      const today = new Date();
      const minBirthYear = today.getFullYear() - age_end; // oldest
      const maxBirthYear = today.getFullYear() - age_start; // youngest

      // Using $expr to build date from dob
      specialFilter.$expr = {
        $and: [
          {
            $gte: [
              {
                $dateFromParts: {
                  year: "$dob.year",
                  month: "$dob.month",
                  day: "$dob.day",
                },
              },
              new Date(minBirthYear, today.getMonth(), today.getDate()),
            ],
          },
          {
            $lte: [
              {
                $dateFromParts: {
                  year: "$dob.year",
                  month: "$dob.month",
                  day: "$dob.day",
                },
              },
              new Date(maxBirthYear, today.getMonth(), today.getDate()),
            ],
          },
        ],
      };
    }
    if (joined_year_start && joined_year_end) {
      if (joined_year_start == "all" || joined_year_end == "all") {
      } else {
        specialFilter.$expr = specialFilter.$expr || { $and: [] };

        specialFilter.$expr.$and.push({
          $and: [
            {
              $gte: [
                {
                  $dateFromParts: {
                    year: "$date_joined_party.year",
                    month: "$date_joined_party.month",
                    day: "$date_joined_party.day",
                  },
                },
                new Date(joined_year_start, 0, 1), // Jan 1 of start year
              ],
            },
            {
              $lte: [
                {
                  $dateFromParts: {
                    year: "$date_joined_party.year",
                    month: "$date_joined_party.month",
                    day: "$date_joined_party.day",
                  },
                },
                new Date(joined_year_end, 11, 31), // Dec 31 of end year
              ],
            },
          ],
        });
      }
    }

    if (party_leader) {
      if (party_leader == "all") {
      } else {
        specialFilter.party_leader = party_leader;
      }
    }

    if (party_sub_leader) {
      if (party_sub_leader == "all") {
      } else {
        specialFilter.party_sub_leader = party_sub_leader;
      }
    }
    if (role_in_party_id) {
      if (role_in_party_id === "all") {
        // No filter for "all"
      } else if (role_in_party_id === "no_role") {
        specialFilter.$or = [
          { role_in_party_id: { $exists: false } },
          { role_in_party_id: null },
        ];
      } else {
        specialFilter.role_in_party_id = role_in_party_id;
      }
    }
    //--- Specific ID Filter (q_id + q_key_id) ---

    const qId = query.q_id;
    const qKeyId = query.q_key_id;
    let specificOr = [];

    if (qId && qKeyId) {
      let ids, fields;
      try {
        ids = Array.isArray(qId) ? qId : JSON.parse(qId);
      } catch {
        ids = [qId];
      }
      try {
        fields = Array.isArray(qKeyId) ? qKeyId : JSON.parse(qKeyId || "[]");
      } catch {
        fields = qKeyId ? qKeyId.split(",") : [];
      }

      const validObjectIds = ids
        .filter((id) => mongoose.Types.ObjectId.isValid(id))
        .map((id) => new mongoose.Types.ObjectId(id));

      if (fields.length && validObjectIds.length) {
        specificOr = fields.map((field) => ({
          [field]: { $in: validObjectIds },
        }));
      }
    }

    // --- General keyword search (q + q_key) ---
    const keyword = query.q?.trim();
    const qKeys = query.q_key;
    let generalOr = [];

    if (keyword && qKeys) {
      let fields;
      try {
        fields = Array.isArray(qKeys) ? qKeys : JSON.parse(qKeys || "[]");
      } catch {
        fields = qKeys ? qKeys.split(",") : [];
      }

      generalOr = fields.map((field) => {
        if (
          (field.endsWith("_id") || field.endsWith("created_by_id")) &&
          mongoose.Types.ObjectId.isValid(keyword)
        ) {
          return { [field]: new mongoose.Types.ObjectId(keyword) };
        }
        return { [field]: { $regex: keyword, $options: "i" } };
      });
    }

    // --- Compose final MongoDB filter ---
    let mongoFilter = { ...deleteFilter, ...specialFilter };

    if (specificOr.length && generalOr.length) {
      mongoFilter.$and = [{ $or: specificOr }, { $or: generalOr }];
    } else if (specificOr.length) {
      mongoFilter.$or = specificOr;
    } else if (generalOr.length) {
      mongoFilter.$or = generalOr;
    }

    // --- Additional filters ---
    if (additionalFilter.length > 0) {
      if (mongoFilter.$and) {
        mongoFilter.$and.push(...additionalFilter);
      } else {
        mongoFilter.$and = [...additionalFilter];
      }
    }

    // --- Query database with filter, pagination, sorting ---
    const [data, total] = await Promise.all([
      Model.find(mongoFilter)
        .sort({ [sortField]: sortOrder })
        .populate(populate)
        .skip(skip)
        .limit(limit),
      Model.countDocuments(mongoFilter),
    ]);

    const totalPages = Math.ceil(total / limit);

    const enhancedData = data.map((row) => {
      // Create an array to store matched jobs
      const jobData = [];

      row.job_name_id.forEach((rowJobId) => {
        jobName.forEach((job) => {
          if (job._id.toString() === rowJobId.toString()) {
            jobData.push(job);
          }
        });
      });

      // Return new object with jobData field
      return {
        ...(row.toObject?.() || row), // Handle both Mongoose documents and plain objects
        jobData: jobData,
      };
    });

    return {
      data: enhancedData, // Return the enhanced data, not original data
      pagination: {
        total,
        totalPages,
        currentPage: page,
        pageSize: limit,
      },
    };
  }

  prop.app.get(
    `${urlAPI}-area-statistics`,
    prop.api_auth,
    prop.jwt_auth,
    prop.request_user,
    async (req, res) => {
      const { province_id, district_id, commune_id, village_id } = req.query;

      try {
        let result = {};

        if (village_id) {
          if (!mongoose.Types.ObjectId.isValid(village_id)) {
            return res.status(400).send({
              success: false,
              message: "village_id មិនត្រឹមត្រូវ!",
            });
          }

          result = await getAreaStatistics("village_id", village_id);
          return res.json({ success: true, ...result });
        }

        if (commune_id) {
          if (!mongoose.Types.ObjectId.isValid(commune_id)) {
            return res.status(400).send({
              success: false,
              message: "commune_id មិនត្រឹមត្រូវ!",
            });
          }
          result = await getAreaStatistics("commune_id", commune_id);
          return res.json({ success: true, ...result });
        }

        if (district_id) {
          if (!mongoose.Types.ObjectId.isValid(district_id)) {
            return res.status(400).send({
              success: false,
              message: "district_id មិនត្រឹមត្រូវ!",
            });
          }
          result = await getAreaStatistics("district_id", district_id);
          return res.json({ success: true, ...result });
        }

        if (province_id) {
          if (!mongoose.Types.ObjectId.isValid(province_id)) {
            return res.status(400).send({
              success: false,
              message: "province_id មិនត្រឹមត្រូវ!",
            });
          }
          result = await getAreaStatistics("province_id", province_id);
          return res.json({ success: true, ...result });
        }

        return res.status(400).send({
          success: false,
          message:
            "មិនមានទិន្នន័យទីតាំង! (province_id,district_id,commune_id,village_id)",
        });
      } catch (error) {
        return res.status(500).send({
          success: false,
          message: "មានបញ្ហាក្នុងការទាញយកទិន្នន័យ",
        });
      }
    }
  );

  async function getAreaStatistics(pin_area_name, pin_area_id) {
    // Create base filter for the area
    const areaFilter = {
      [pin_area_name]: new mongoose.Types.ObjectId(pin_area_id),
      deleted: false, // Exclude soft deleted records
    };

    // Count total population (all records in the area)
    const totalPopulation = await model.countDocuments(areaFilter);

    // Count total members (you might need to adjust this based on your member criteria)
    // If members are all records, then it's same as totalPopulation
    // If there's a specific field for membership, adjust accordingly
    const totalMembers = await model.countDocuments(areaFilter);

    // Count by gender
    const maleCount = await model.countDocuments({
      ...areaFilter,
      sex: { $regex: "^male$", $options: "i" },
    });

    const femaleCount = await model.countDocuments({
      ...areaFilter,
      sex: { $regex: "^female$", $options: "i" },
    });

    // Count by marital status
    const singleCount = await model.countDocuments({
      ...areaFilter,
      matual_status: { $regex: "^single$", $options: "i" },
    });

    const marriedCount = await model.countDocuments({
      ...areaFilter,
      matual_status: { $regex: "^married$", $options: "i" },
    });

    const divorceCount = await model.countDocuments({
      ...areaFilter,
      matual_status: { $regex: "^divorce$", $options: "i" },
    });

    // Count by age groups (you might want to adjust these ranges)
    const today = new Date();

    // Youth (18-25)
    const youthMinBirthYear = today.getFullYear() - 25;
    const youthMaxBirthYear = today.getFullYear() - 18;
    const youthCount = await model.countDocuments({
      ...areaFilter,
      $expr: {
        $and: [
          {
            $gte: [
              {
                $dateFromParts: {
                  year: "$dob.year",
                  month: "$dob.month",
                  day: "$dob.day",
                },
              },
              new Date(youthMinBirthYear, today.getMonth(), today.getDate()),
            ],
          },
          {
            $lte: [
              {
                $dateFromParts: {
                  year: "$dob.year",
                  month: "$dob.month",
                  day: "$dob.day",
                },
              },
              new Date(youthMaxBirthYear, today.getMonth(), today.getDate()),
            ],
          },
        ],
      },
    });

    // Adults (26-60)
    const adultMinBirthYear = today.getFullYear() - 60;
    const adultMaxBirthYear = today.getFullYear() - 26;
    const adultCount = await model.countDocuments({
      ...areaFilter,
      $expr: {
        $and: [
          {
            $gte: [
              {
                $dateFromParts: {
                  year: "$dob.year",
                  month: "$dob.month",
                  day: "$dob.day",
                },
              },
              new Date(adultMinBirthYear, today.getMonth(), today.getDate()),
            ],
          },
          {
            $lte: [
              {
                $dateFromParts: {
                  year: "$dob.year",
                  month: "$dob.month",
                  day: "$dob.day",
                },
              },
              new Date(adultMaxBirthYear, today.getMonth(), today.getDate()),
            ],
          },
        ],
      },
    });

    // Seniors (61+)
    const seniorMinBirthYear = today.getFullYear() - 120; // Assuming max age 120
    const seniorMaxBirthYear = today.getFullYear() - 61;
    const seniorCount = await model.countDocuments({
      ...areaFilter,
      $expr: {
        $and: [
          {
            $gte: [
              {
                $dateFromParts: {
                  year: "$dob.year",
                  month: "$dob.month",
                  day: "$dob.day",
                },
              },
              new Date(seniorMinBirthYear, today.getMonth(), today.getDate()),
            ],
          },
          {
            $lte: [
              {
                $dateFromParts: {
                  year: "$dob.year",
                  month: "$dob.month",
                  day: "$dob.day",
                },
              },
              new Date(seniorMaxBirthYear, today.getMonth(), today.getDate()),
            ],
          },
        ],
      },
    });

    return {
      statistics: {
        total_members: totalMembers,
        gender: {
          male: maleCount,
          female: femaleCount,
        },
        marital_status: {
          single: singleCount,
          married: marriedCount,
          divorce: divorceCount,
        },
        age_groups: {
          youth: youthCount, // 18-25
          adult: adultCount, // 26-60
          senior: seniorCount, // 61+
        },
      },
    };
  }

  prop.app.put(
    `${urlAPI}/:id`,
    prop.api_auth,
    prop.jwt_auth,
    prop.request_user,
    async (req, res) => {
      var data = ({ name, note, status } = req.body);
      await update(res, req, [], data, model, "ទិន្នន័យមេ - ការងារ", "NA");
    }
  );

  prop.app.delete(
    `${urlAPI}/:id`,
    prop.api_auth,
    prop.jwt_auth,
    prop.request_user,
    async (req, res) => {
      await remove(res, req, model, tital_Toast, "NA");
    }
  );

  prop.app.get(
    `${urlAPI}-retrieve-data-for-create`,
    prop.api_auth,
    prop.jwt_auth,
    prop.request_user,
    async (req, res) => {
      const { village_id } = req.query;
      const dataEducationLevel = await modelEducation_level.find({});
      const dataJobName = await modelJobName.find({});
      const dataRoleInParty = await modelRoleInParty.find({});

      if (!village_id) {
        return res.status(400).json({
          success: false,
          message: "មិនមានទិន្នន័យការងារ", // No education level data
        });
      }

      if (village_id) {
        if (!mongoose.Types.ObjectId.isValid(village_id)) {
          return res.status(400).json({
            success: false,
            message: "មិនមានទិន្នន័យនៅក្នុងប្រព័ន្ធ!",
          });
        }
      }
      const dataElectionOffice = await modelElectionOffice.find({
        village_id: village_id,
      });

      return res.json({
        village_id: village_id,
        success: true,
        village_id: village_id,
        data: {
          success: true,
          education_level: dataEducationLevel,
          job_name: dataJobName,
          matual_status: [
            {
              label: "នៅលីវ",
              value: "single",
            },
            {
              label: "បានរៀបការ",
              value: "married",
            },
            {
              label: "លែងលះ",
              value: "divorced",
            },
          ],
          gender: [
            {
              label: "ប្រុស",
              value: "male",
            },
            {
              label: "ស្រី",
              value: "female",
            },
          ],
          role_in_party: dataRoleInParty,
          election_office: dataElectionOffice,
        },
      });
    }
  );

  prop.app.get(
    `${urlAPI}-filter-party-sub-leader/`,
    prop.api_auth,
    prop.jwt_auth,
    prop.request_user,
    async (req, res) => {
      const {
        party_sub_leader,
        village_id,
        province_id,
        district_id,
        commune_id,
      } = req.query;
      let result = {};
      if (!party_sub_leader) {
        res.send({
          success: false,
          message: "មិនមានទិន្នន័យ​ (party_sub_leader) ក្នុងប្រព័ន្ធ!",
        });
      }

      if (village_id) {
        if (!mongoose.Types.ObjectId.isValid(village_id)) {
          return res.status(400).send({
            success: false,
            message: "village_id មិនត្រឹមត្រូវ!",
          });
        }
        result = await getFilterPartySub(
          req,
          party_sub_leader,
          "village_id",
          village_id
        );
        return res.json({ success: true, ...result });
      }

      if (commune_id) {
        if (!mongoose.Types.ObjectId.isValid(commune_id)) {
          return res.status(400).send({
            success: false,
            message: "commune_id មិនត្រឹមត្រូវ!",
          });
        }
        result = await getFilterPartySub(
          req,
          party_sub_leader,
          "commune_id",
          commune_id
        );
        return res.json({ success: true, ...result });
      }

      if (district_id) {
        if (!mongoose.Types.ObjectId.isValid(district_id)) {
          return res.status(400).send({
            success: false,
            message: "district_id មិនត្រឹមត្រូវ!",
          });
        }
        result = await getFilterPartySub(
          req,
          party_sub_leader,
          "district_id",
          district_id
        );
        return res.json({ success: true, ...result });
      }

      if (province_id) {
        if (!mongoose.Types.ObjectId.isValid(province_id)) {
          return res.status(400).send({
            success: false,
            message: "province_id មិនត្រឹមត្រូវ!",
          });
        }
        result = await getFilterPartySub(
          req,
          party_sub_leader,
          "province_id",
          province_id
        );
        return res.json({ success: true, ...result });
      }

      return res.json({
        success: false,
        message:
          "មិនមានទិន្នន័យក្នុងប្រព័ន្ធ commune_id, district_id, province_id, village_id!",
      });

      // let result = await getPagination(
      //   req.query,
      //   model,
      //   [],
      //   [
      //     {
      //       party_sub_leader: party_sub_leader,
      //     },
      //   ]
      // );
      // res.json({ success: true, ...result });
    }
  );

  async function getFilterPartySub(
    req,
    party_sub_leader,
    area_name,
    pin_area_id
  ) {
    const filters = [];

    // Create dynamic field name if area_name contains field name
    if (area_name && pin_area_id) {
      const filterObj = {};
      filterObj[area_name] = pin_area_id; // Dynamic field name
      filters.push(filterObj);
    }

    if (party_sub_leader) {
      filters.push({ party_sub_leader: party_sub_leader });
    }

    return await getPagination(req.query, model, [], filters);
  }
};

module.exports = route;
