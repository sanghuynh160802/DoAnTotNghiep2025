// const nodemailer = require('nodemailer');
// const dotenv = require('dotenv');
// dotenv.config();

//     const  sendEmail = async ({ emailFrom, emailTo, subject, text }) => {
//         const transporter = nodemailer.createTransport({
//             host: process.env.SMTP_HOST,
//             port: process.env.SMTP_PORT,
//             auth: {
//                 user: process.env.SMTP_USER,
//                 pass: process.env.SMTP_PASS,
//             },
            
//         }
//         );
//         console.log(emailFrom,emailTo,subject,text);
//         await transporter.sendMail({
//             from: emailFrom,
//             to: emailTo,
//             subject: subject,
//             text: text
//         });
//     }
// module.exports = {
//     sendEmail 
// };  



const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const knex = require('knex');
const knexConfig = require('../knexfile');
const environment = 'development';
const config = knexConfig[environment];
const db = knex(config);
const dayjs = require("dayjs");

const sendEmail = async ({
  applicant_id,
  company_id,
  job_id,
  applicant_email,
  applicant_phone,
  title,
  company_name,
  cv_content_base64,
  cv_filename,
  cv_mimetype
}) => {
  try {
    const id = uuidv4();

    const saveDir = "D:/SANG/Do An Tot Nghiep/WEB-THAMKHAO/JOBINFOR/QLVLBackEnd/public/cvs";
    
    // Ensure safe filename
    const safeFileName = `${applicant_email}_${title}_${company_name}`
      .replace(/[^a-zA-Z0-9-_\.]/g, "_");

    // Get file extension from original filename
    let ext = ".pdf"; // default
    if (cv_filename) {
      ext = path.extname(cv_filename) || ".pdf";
    }
    
    const fileName = `${safeFileName}${ext}`;
    const savePath = path.join(saveDir, fileName);

    // Decode and save file
    const fileBuffer = Buffer.from(cv_content_base64, "base64");
    fs.writeFileSync(savePath, fileBuffer);

    const submitted_at = dayjs().format("YYYY-MM-DD HH:mm:ss");
    const updated_at = dayjs().format("YYYY-MM-DD HH:mm:ss");

    await db('crawl_data.cv_submissions').insert({
      id,
      applicant_id,
      company_id,
      job_id,
      applicant_email,
      applicant_phone,
      cv_url: savePath,
      title,
      company_name,
      submitted_at,
      updated_at,
      status: 'PENDING',
    });

    return { success: true, id };
  } catch (error) {
    console.error("Error saving CV submission:", error);
    throw error;
  }
};

const getAllCVsByApplicantID = async (applicant_id) => {
  try {
    const cvs = await db('crawl_data.cv_submissions')
      .where({ applicant_id })
      .orderBy('submitted_at', 'desc');
    return cvs;
  } catch (error) {
    console.error("Error fetching CVs by applicant_id ID:", error);
    throw error;
  }
};

const getAllCVsByCompanyID = async (company_id) => {
  try {
    const cvs = await db('crawl_data.cv_submissions')
      .where({ company_id })
      .orderBy('submitted_at', 'desc');
    return cvs;
  } catch (error) {
    console.error("Error fetching CVs by company ID:", error);
    throw error;
  }
};

const getAllCVsByCompanyName = async (company_name) => {
  try {
    const cvs = await db('crawl_data.cv_submissions')
      .where({ company_name })
      .orderBy('submitted_at', 'desc');
    return cvs;
  } catch (error) {
    console.error("Error fetching CVs by company name:", error);
    throw error;
  }
};

const updateCVStatus = async (id, status) => {
  try {
    const affectedRows = await db('crawl_data.cv_submissions')
      .where({ id })
      .update({
        status,
        updated_at: dayjs().format('YYYY-MM-DD HH:mm:ss')  // Optional: track when updated
      });

    return affectedRows > 0; // true if update success
  } catch (error) {
    console.error("Error updating CV status:", error);
    throw error;
  }
};

module.exports = {
  sendEmail,
  getAllCVsByApplicantID,
  getAllCVsByCompanyID,
  getAllCVsByCompanyName,
  updateCVStatus,
};

