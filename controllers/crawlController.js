const knex = require("knex");
const config = require("../knexfile");
const mailService  = require('../services/mailService');
const environment = process.env.NODE_ENV || "development";
const db = knex(config[environment]);
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');

const getDataCrawl = async () => {
  return await db("job_data").select(
    "job_data.id",
    "job_data.Title",
    "job_data.Company_Name",
    "job_data.Time",
    "job_data.City",
    "job_data.Age",
    "job_data.Sexual",
    "job_data.Probation_Time",
    "job_data.Work_Way",
    "job_data.Job",
    "job_data.Profession",
    "job_data.Place",
    "job_data.Right",
    "job_data.Number_Employee",
    "job_data.Experience",
    "job_data.Level",
    "job_data.Salary",
    "job_data.Education",
    "job_data.Description",
    "job_data.Requirement",
    "job_data.Deadline",
    "job_data.Source_Picture"
  );
};
const getDataCrawlById = async (id) => {
  return await db("job_data").where({ id }).first();
};
// D:\SANG\Do An Tot Nghiep\WEB-THAMKHAO\JOBINFOR\QLVLBackEnd\controllers\crawlController.js
const createJob = async (jobData) => {
  const newJob = {
    Title: jobData.Title,
    Company_Name: jobData.Company_Name,
    Time: new Date().toISOString(),
    City: jobData.City,
    Age: jobData.Age || null,
    Sexual: jobData.Sexual || null,
    Probation_Time: jobData.Probation_Time || null,
    Work_Way: jobData.Work_Way,
    Job: jobData.Job || null,
    Profession: jobData.Profession,
    Place: jobData.Place,
    Right: jobData.Right || null,
    Number_Employee: jobData.Number_Recruitment || null,
    Experience: jobData.Experience,
    Level: jobData.Level,
    Salary: jobData.Salary,
    Education: jobData.Education,
    Description: jobData.Description,
    Requirement: jobData.Requirement,
    Deadline: jobData.Deadline,
    Source_Picture: jobData.Source_Picture || null
  };

  await db("job_data").insert(newJob);
  return newJob;
};
const updateJob = (id, updatedJob) => {
  return db("job_data").where({ id }).update(updatedJob);
};
const getJobByTitle = async () => {
  return await db("job_data")
    .distinct("job_data.job")
    .select("job_data.job")
    .limit(10);
};
const getAllProfessions = async () => {
  return await db("job_data")
    .distinct("Profession")
    .select("Profession")
    .whereNotNull("Profession")
    .andWhere("Profession", "!=", "")
    .orderBy("Profession", "asc");
};
const getAllLevels = async () => {
  const levels = await db("job_data")
    .distinct("Level")
    .select("Level")
    .whereNotNull("Level")
    .andWhere("Level", "!=", "");

  // Manually define English job levels
  const englishLevels = ["Intern", "Junior", "Middle", "Senior", "Lead", "Manager"];

  // Custom sort: English levels first in defined order, others after alphabetically
  const sortedLevels = levels.sort((a, b) => {
    const aIndex = englishLevels.indexOf(a.Level);
    const bIndex = englishLevels.indexOf(b.Level);

    const aIsEn = aIndex !== -1;
    const bIsEn = bIndex !== -1;

    if (aIsEn && bIsEn) {
      return aIndex - bIndex; // sort by defined English order
    } else if (aIsEn) {
      return -1;
    } else if (bIsEn) {
      return 1;
    } else {
      return a.Level.localeCompare(b.Level); // alphabetical for non-English
    }
  });

  return sortedLevels;
};
const getAllWorkWays = async () => {
  const data = await db("job_data")
    .distinct("Work_Way")
    .select("Work_Way")
    .whereNotNull("Work_Way")
    .andWhere("Work_Way", "!=", "");

  // Define known English work ways (adjust as needed)
  const englishWorkWays = [
    "At office",
    "Hybrid",
    "Remote",
    "Unknown"
  ];

  const english = data.filter(item => englishWorkWays.includes(item.Work_Way));
  const nonEnglish = data.filter(item => !englishWorkWays.includes(item.Work_Way));

  return [...english, ...nonEnglish.sort((a, b) => a.Work_Way.localeCompare(b.Work_Way))];
};
const getAllEducation = async () => {
  return await db("job_data")
    .distinct("Education")
    .select("Education")
    .whereNotNull("Education")
    .andWhere("Education", "!=", "")
    .orderByRaw(`
      CASE 
        WHEN Education = 'Cao dang' THEN 1
        WHEN Education = 'Chung chi' THEN 2
        WHEN Education = 'Dai hoc' THEN 3
        WHEN Education = 'University Graduate' THEN 4
        WHEN Education = 'Trung cap' THEN 5
        WHEN Education = 'Trung hoc' THEN 6
        WHEN Education = 'Không yêu cầu bằng cấp' THEN 99
        ELSE 100
      END
    `);
};
const normalizeExperience = (exp) => {
  if (!exp) return exp;

  exp = exp.toLowerCase().trim();

  // Normalize: No experience
  if (/(chua co kinh nghiem|chưa có kinh nghiệm|no experience|none)/.test(exp)) 
    return 'Chưa có kinh nghiệm';

  // Normalize: Under (below)
  if (/(duoi|dưới|under|below|less than)/.test(exp)) {
    const match = exp.match(/\d+/);
    return `Dưới ${match ? match[0] : 1} năm`;
  }

  // Normalize: Over (above)
  if (/(hon|hơn|tren|trên|over|above|more than)/.test(exp)) {
    const match = exp.match(/\d+/);
    return `Hơn ${match ? match[0] : 5} năm`;
  }

  // Normalize: numeric year like "1", "2 nam", "2 years"
  const match = exp.match(/(\d{1,2})/);
  if (match) {
    return `${match[1]} năm`;
  }

  return exp; // fallback if unknown format
};

// Hàm lấy thứ tự ưu tiên cho sắp xếp
const getExperienceOrder = (exp) => {
  if (!exp) return 1000;

  if (exp === 'Chưa có kinh nghiệm') return 0;

  const lower = exp.toLowerCase();

  const matchUnder = lower.match(/^dưới (\d+) năm$/);
  if (matchUnder) return parseFloat(matchUnder[1]) - 0.5;

  const matchExact = lower.match(/^(\d+) năm$/);
  if (matchExact) return parseInt(matchExact[1]);

  const matchOver = lower.match(/^hơn (\d+) năm$/);
  if (matchOver) return parseFloat(matchOver[1]) + 0.5;

  return 1000; // fallback
};

const getAllExperiences = async () => {
  const rawExperiences = await db("job_data")
    .distinct("Experience")
    .select("Experience")
    .whereNotNull("Experience")
    .andWhere("Experience", "!=", "");

  const normalizedSet = new Set();
  rawExperiences.forEach(({ Experience }) => {
    const normalized = normalizeExperience(Experience);
    normalizedSet.add(normalized);
  });

  const normalizedArr = Array.from(normalizedSet);

  normalizedArr.sort((a, b) => {
    return getExperienceOrder(a) - getExperienceOrder(b);
  });

  return normalizedArr;
};

// utils/normalize.js (optional to move to separate file)
const normalize = (str) => {
  return (str || "")
    .normalize("NFD")                      // Decompose accents (e.g. "Hồ" → "Hơ")
    .replace(/[\u0300-\u036f]/g, '')      // Remove diacritics (accents)
    .replace(/[^a-zA-Z0-9]/g, '')         // Remove special characters (., -, , ...)
    .toLowerCase();                       // Lowercase all
};

const containsAllChars = (str, chars) => {
  return chars.every(char => str.includes(char));
};

// Hàm trích xuất min, max lương (đơn vị VND)
const extractSalaryRange = (salaryStr) => {
  if (!salaryStr) return { min: 0, max: 0 };

  // Chuyển về chữ thường, loại bỏ dấu cách, chữ "triệu" thành số
  let str = salaryStr.toLowerCase().replace(/\s/g, '');

  // Chuyển "trieu" thành "000000" (1 triệu = 1,000,000 VND)
  str = str.replace(/trieu/g, '000000');

  // Tách thành 2 phần nếu có dấu "-"
  const parts = str.split('-');

  const parseNumber = (s) => {
    const n = parseInt(s.replace(/[^0-9]/g, ''), 10);
    return isNaN(n) ? 0 : n;
  };

  if (parts.length === 2) {
    // Trường hợp có khoảng lương
    const min = parseNumber(parts[0]);
    const max = parseNumber(parts[1]);
    return { min, max };
  } else {
    // Trường hợp 1 số duy nhất
    const val = parseNumber(parts[0]);
    return { min: val, max: val };
  }
};

const filterJob = async (
  key1,
  key2,
  key3,
  level,
  workWay,
  education,
  experience,
  salaryFilter // thêm param này
) => {
  const normalizedKey1 = normalize(key1);
  const normalizedKey2 = normalize(key2);
  const normalizedCityKeyword = normalize(key3);
  const normalizedLevel = normalize(level);
  const normalizedWorkWay = normalize(workWay);
  const normalizedEducation = normalize(education);
  const normalizedExperience = normalize(experience);
  const salaryMinFilter = salaryFilter ? parseInt(salaryFilter, 10) : 0;

  const data = await db("job_data").select("*");

  const filtered = data.filter((item) => {
    const normalizedTitle = normalize(item.Title);
    const normalizedProfession = normalize(item.Profession);
    const normalizedCity = normalize(item.City);
    const normalizedItemLevel = normalize(item.Level);
    const normalizedItemWorkWay = normalize(item.Work_Way);
    const normalizedItemEducation = normalize(item.Education);
    const normalizedItemExperience = normalize(item.Experience);

    const cityMatch =
      normalizedCityKeyword === "hochiminh"
        ? containsAllChars(normalizedCity, ['h', 'c', 'm'])
        : normalizedCity.includes(normalizedCityKeyword);

    // Xử lý mức lương
    const { min: itemSalaryMin, max: itemSalaryMax } = extractSalaryRange(item.Salary);

    // Lọc theo mức lương: chỉ lấy job có max lương >= filter hoặc min lương >= filter
    const salaryMatch = salaryMinFilter === 0 || itemSalaryMax >= salaryMinFilter || itemSalaryMin >= salaryMinFilter;

    return (
      normalizedTitle.includes(normalizedKey1) &&
      normalizedProfession.includes(normalizedKey2) &&
      cityMatch &&
      (normalizedLevel === "" || normalizedItemLevel.includes(normalizedLevel)) &&
      (normalizedWorkWay === "" || normalizedItemWorkWay.includes(normalizedWorkWay)) &&
      (normalizedEducation === "" || normalizedItemEducation.includes(normalizedEducation)) &&
      (normalizedExperience === "" || normalizedItemExperience.includes(normalizedExperience)) &&
      salaryMatch
    );
  });

  return filtered;
};

const companyNameMatchScore = (input, target) => {
  // Tính điểm so khớp: dựa trên số từ input có xuất hiện trong target
  const inputWords = input.split(/\s+/).filter(Boolean);
  const targetWords = target.split(/\s+/).filter(Boolean);

  if (inputWords.length === 0) return 0;

  let matchedCount = 0;
  inputWords.forEach(word => {
    if (targetWords.includes(word)) {
      matchedCount++;
    }
  });

  return matchedCount / inputWords.length; // tỷ lệ từ match
};

// Normalize string: remove accents, spaces, special chars, lowercase
const normalizeStr = (str) => {
  if (!str) return "";
  return str
    .normalize("NFD")                     // decompose accented chars
    .replace(/[\u0300-\u036f]/g, "")     // remove accents
    .replace(/\s+/g, "")                  // remove all whitespace
    .replace(/[^a-zA-Z0-9]/g, "")        // remove special chars
    .toLowerCase();
};

// Check if needle is contiguous substring of haystack AND long enough (≥ 90%)
const isMatch = (needle, haystack) => {
  needle = normalizeStr(needle);
  haystack = normalizeStr(haystack);
  if (!needle || !haystack) return false;

  const isSubstring = haystack.includes(needle);
  const minLengthRequirement = needle.length >= Math.floor(haystack.length * 0.9);
  return isSubstring && minLengthRequirement;
};

const getJobsByUserId = async (user_id) => {
  if (!user_id) return [];

  // Get user skills for user_id
  const userSkills = await db('user_skill').where({ user_id });
  if (!userSkills.length) return [];

  // Get all jobs
  const jobs = await db('job_data').select('*');

  // 1) Full match: level with Level, skill with Skills, experience with Experience, work_way with Work_Way, city with City
  // Note: job_data.Skill field corresponds to user_skill.skill
  let matchedJobs = [];
  for (const job of jobs) {
    for (const skill of userSkills) {
      const matchesAllFields = 
        isMatch(skill.level, job.Level) &&
        isMatch(skill.skill, job.Skills) &&
        isMatch(skill.experience, job.Experience) &&
        isMatch(skill.work_way, job.Work_Way) &&
        isMatch(skill.city, job.City);

      if (matchesAllFields) {
        matchedJobs.push(job);
        break;
      }
    }
  }
  if (matchedJobs.length > 0) return matchedJobs;

  // 2) Match skill with Title (job.Title), rest fields same as above
  matchedJobs = [];
  for (const job of jobs) {
    for (const skill of userSkills) {
      const matchesAllFields =
        isMatch(skill.level, job.Level) &&
        isMatch(skill.skill, job.Title) && // skill matched to Title here
        isMatch(skill.experience, job.Experience) &&
        isMatch(skill.work_way, job.Work_Way) &&
        isMatch(skill.city, job.City);

      if (matchesAllFields) {
        matchedJobs.push(job);
        break;
      }
    }
  }
  if (matchedJobs.length > 0) return matchedJobs;

  // 3) Reduce fields one by one: level, experience, work_way, city
  const fieldsToReduce = ['level', 'experience', 'work_way', 'city'];
  for (const field of fieldsToReduce) {
    matchedJobs = [];
    for (const job of jobs) {
      for (const skill of userSkills) {
        const jobFieldName = field.charAt(0).toUpperCase() + field.slice(1).replace('_', '_');
        let jobFieldVal = job[jobFieldName];
        if (!jobFieldVal) jobFieldVal = '';

        if (isMatch(skill[field], jobFieldVal)) {
          matchedJobs.push(job);
          break;
        }
      }
    }
    if (matchedJobs.length > 0) return matchedJobs;
  }

  // If no matches, return empty array
  return [];
};

const getJobsByJobId = async (job_id) => {
  if (!job_id) return [];

  // Get the job details by ID
  const targetJob = await db('job_data').where({ id: job_id }).first();
  if (!targetJob) return [];

  // Get all other jobs (excluding the target job)
  const jobs = await db('job_data').whereNot({ id: job_id }).select('*');

  let matchedJobs = [];

  // 1) Full match on Level, Skill, Experience, Work_Way, City
  for (const job of jobs) {
    const matchesAllFields =
      isMatch(targetJob.Level, job.Level) &&
      isMatch(targetJob.Skill, job.Skill) &&
      isMatch(targetJob.Experience, job.Experience) &&
      isMatch(targetJob.Work_Way, job.Work_Way) &&
      isMatch(targetJob.City, job.City);

    if (matchesAllFields) {
      matchedJobs.push(job);
    }
  }
  if (matchedJobs.length > 0) return matchedJobs;

  // 2) Match Skill with Title, rest fields same
  matchedJobs = [];
  for (const job of jobs) {
    const matchesAllFields =
      isMatch(targetJob.Level, job.Level) &&
      isMatch(targetJob.Skill, job.Title) && // Skill compared to Title
      isMatch(targetJob.Experience, job.Experience) &&
      isMatch(targetJob.Work_Way, job.Work_Way) &&
      isMatch(targetJob.City, job.City);

    if (matchesAllFields) {
      matchedJobs.push(job);
    }
  }
  if (matchedJobs.length > 0) return matchedJobs;

  // 3) Reduce fields one by one: Level, Experience, Work_Way, City
  const fieldsToReduce = ['Level', 'Experience', 'Work_Way', 'City'];
  for (const field of fieldsToReduce) {
    matchedJobs = [];
    for (const job of jobs) {
      const targetValue = targetJob[field] || '';
      const jobValue = job[field] || '';

      if (isMatch(targetValue, jobValue)) {
        matchedJobs.push(job);
      }
    }
    if (matchedJobs.length > 0) return matchedJobs;
  }

  return [];
};

const fetchJobsByUser = async (user_id) => {
  return await db("job_data")
    .where({ user_id })
    .select(
      "id",
      "Title",
      "Company_Name",
      "Time",
      "City",
      "Age",
      "Sexual",
      "Probation_Time",
      "Work_Way",
      "Job",
      "Profession",
      "Place",
      "Right",
      "Number_Employee",
      "Experience",
      "Level",
      "Salary",
      "Education",
      "Description",
      "Requirement",
      "Deadline",
      "Source_Picture",
      "user_id"
    );
};

const getSourcePictureByCompanyName = async (companyNameInput) => {
  const normalizedInput = normalize(companyNameInput);

  // Lấy toàn bộ Company_Name và Source_Picture
  const rows = await db("job_data").select("Company_Name", "Source_Picture");

  // Tính điểm so khớp từng row
  const scoredRows = rows.map(row => {
    const normalizedDbName = normalize(row.Company_Name);
    return {
      ...row,
      score: companyNameMatchScore(normalizedInput, normalizedDbName)
    };
  });

  // Lọc ra các rows có điểm > threshold (vd: 0.5)
  const threshold = 0.5;
  const filtered = scoredRows.filter(r => r.score >= threshold);

  if (filtered.length > 0) {
    // Lấy row có điểm cao nhất
    filtered.sort((a, b) => b.score - a.score);
    return filtered[0].Source_Picture;
  } else {
    // Nếu không tìm thấy, trả về 1 ảnh ngẫu nhiên
    const count = await db("job_data").count("Source_Picture as cnt").first();
    const totalCount = parseInt(count.cnt, 10) || 1;
    const randomOffset = Math.floor(Math.random() * totalCount);

    const randomRow = await db("job_data")
      .select("Source_Picture")
      .limit(1)
      .offset(randomOffset)
      .first();

    return randomRow ? randomRow.Source_Picture : null;
  }
};

const getAllCVsByApplicantID = async (req, res) => {
	try {
	  const { id } = req.params;
	  const cvs = await mailService.getAllCVsByApplicantID(id);
	  res.status(200).json({ data: cvs });
	} catch (error) {
	  console.error("getAllCVsByApplicantID error:", error);
	  res.status(500).json({ message: "Failed to fetch CVs by applicant ID", error: error.message });
	}
};

const getAllCVsByCompanyID = async (req, res) => {
	try {
	  const { id } = req.params;
	  const cvs = await mailService.getAllCVsByCompanyID(id);
	  res.status(200).json({ data: cvs });
	} catch (error) {
	  console.error("getAllCVsByCompanyID error:", error);
	  res.status(500).json({ message: "Failed to fetch CVs by company ID", error: error.message });
	}
};
  
const getAllCVsByCompanyName = async (req, res) => {
	try {
	  const { name } = req.params;
	  const cvs = await mailService.getAllCVsByCompanyName(name);
	  res.status(200).json({ data: cvs });
	} catch (error) {
	  console.error("getAllCVsByCompanyName error:", error);
	  res.status(500).json({ message: "Failed to fetch CVs by company name", error: error.message });
	}
};

const updateCVStatus = async (req, res) => {
	try {
	  const { id } = req.params; // id of the CV submission
	  const { status } = req.body; // new status and optional note
  
	  // Validate
	  const allowedStatuses = ['REVIEWED', 'ACCEPTED', 'REJECTED'];
	  if (!allowedStatuses.includes(status)) {
		return res.status(400).json({ message: "Invalid status value." });
	  }
  
	  const updated = await mailService.updateCVStatus(id, status);
  
	  if (updated) {
		res.status(200).json({ 
		  status: "Success", 
		  message: `CV status updated to ${status}.` 
		});
	  } else {
		res.status(404).json({ message: "CV submission not found." });
	  }
	} catch (error) {
	  console.error("updateCVStatus error:", error);
	  res.status(500).json({ message: "Failed to update CV status.", error: error.message });
	}
};  

const saveEmployerMessage = async (submissionId, message) => {
  return await db("crawl_data.cv_submissions")
    .where({ id: submissionId })
    .update({ employer_message: message });
};

// Create new user skill
const createUserSkill = async (data) => {
  const skillEntry = {
    id: uuidv4(),
    user_id: data.user_id,
    level: data.level,
    skill: data.skill,
    experience: data.experience,
    work_way: data.work_way,
    city: data.city
  };

  await db("user_skill").insert(skillEntry);
  return skillEntry;
};

// Get user skills by user ID
const getUserSkillsByUserId = async (user_id) => {
  try {
    const skills = await db("user_skill").where({ user_id: user_id }).select("*");
    return skills;
  } catch (error) {
    console.error("Error getting user skills by user ID:", error);
    throw error;
  }
};

// Save a job post
const savePost = async (data) => {
  const savedPost = {
    user_id: data.user_id.toString(),
    post_id: data.post_id.toString()
  };

  await db("save_post").insert(savedPost);
  return savedPost;
};

// Get all saved posts by user_id
const getSavedPostsByUserId = async (user_id) => {
  const posts = await db("save_post")
    .where({ user_id: user_id.toString() })
    .select("*");
  return posts;
};

// Delete saved post by post_id
const deleteSavedPostByPostId = async (post_id) => {
  const result = await db("save_post")
    .where({ post_id: post_id.toString() })
    .del();
  return result;
};

const getIndustryFields = () => {
  try {
    const filePath = path.join(__dirname, '../public/Industry-Fields.txt');
    const data = fs.readFileSync(filePath, 'utf8');
    
    // Split by new lines and filter out empty lines
    const industries = data.split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);
      
    return industries;
  } catch (err) {
    console.error('Error reading industry fields:', err);
    return [];
  }
};

module.exports = {
  getDataCrawl,
  getDataCrawlById,
  updateJob,
  getJobByTitle,
  filterJob,
  getAllProfessions,
  getAllLevels,
  getAllWorkWays,
  getAllEducation,
  getAllExperiences,
  getSourcePictureByCompanyName,
  getAllCVsByApplicantID,
  getAllCVsByCompanyID,
	getAllCVsByCompanyName,
	updateCVStatus,
  saveEmployerMessage,
  createUserSkill,
  getUserSkillsByUserId,
  getJobsByUserId,
  getJobsByJobId,
  savePost,
  getSavedPostsByUserId,
  deleteSavedPostByPostId,
  createJob,
  fetchJobsByUser,
  getIndustryFields,
};
