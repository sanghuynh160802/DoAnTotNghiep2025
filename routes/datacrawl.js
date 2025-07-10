const express = require('express');
const router = express.Router();
const CrawlController = require('../controllers/crawlController');
const bodyParser = require('body-parser')
router.use(bodyParser.json())

router.get('/dataCrawl', async (req, res) => {
	// const page = parseInt(req.query.page) || 1; 
	// const pageSize = parseInt(req.query.pageSize) || 10;
	try {
		const data = await CrawlController.getDataCrawl();
		res.json(data);
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: 'Internal server error1' });
	}
});
router.get('/dataCrawl/:id', async (req, res) => {
	const jobID = req.params.id;
	try {
		const data = await CrawlController.getDataCrawlById(jobID);
		res.json(data);
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: 'Internal server error2' });
	}
});
router.put('/updatejob/:id', async (req, res) => {
	const updatedUser = req.body;
	try {
		const job_id = req.params.id;
		const job = await CrawlController.getDataCrawlById(job_id);
		if (job) {
			await CrawlController.updateJob(job_id, updatedUser);
			const job = await CrawlController.getDataCrawlById(job_id);
			res.json({ 
				message: 'Job updated',
				data: job
			 });	
		} else {
			res.status(404).json({ error: 'Job not found' });
		}
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: 'Internal server error' });
	}
})
router.get('/jobtitle', async (req, res) => {
	try {
		const data = await CrawlController.getJobByTitle();
		res.json({
			message: 'Job Title',
			data: data
		});
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: 'Internal server error' });
	}
})
router.get('/filterjob', async (req, res) => {
  const key1 = req.query.key1 || "";
  const key2 = req.query.key2 || "";
  const key3 = req.query.key3 || "";
  const level = req.query.level || "";
  const workWay = req.query.workWay || "";
  const education = req.query.education || "";
  const experience = req.query.experience || "";
  const salary = req.query.salary || ""; // thêm

  try {
    const data = await CrawlController.filterJob(key1, key2, key3, level, workWay, education, experience, salary);
    console.log("Filters:", { key1, key2, key3, level, workWay, education, experience, salary });
    res.json({
      message: 'Job Title',
      data: data
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});
router.get('/jobs-by-user/:user_id', async (req, res) => {
  try {
    const user_id = req.params.user_id;
    const jobs = await CrawlController.getJobsByUserId(user_id);
    res.json({
      message: `Jobs matched for user ${user_id}`,
      data: jobs,
    });
  } catch (err) {
    console.error('Error fetching jobs by user id:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});
router.get('/jobs-by-job/:job_id', async (req, res) => {
  try {
    const job_id = req.params.job_id;
    const jobs = await CrawlController.getJobsByJobId(job_id);
    res.json({
      message: `Jobs matched for user ${job_id}`,
      data: jobs,
    });
  } catch (err) {
    console.error('Error fetching jobs by user id:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});
router.get('/professions', async (req, res) => {
	try {
	  const data = await CrawlController.getAllProfessions();
	  res.json({
		message: 'All unique professions',
		data: data
	  });
	} catch (err) {
	  console.error(err);
	  res.status(500).json({ error: 'Internal server error' });
	}
});
router.get('/levels', async (req, res) => {
	try {
	  const data = await CrawlController.getAllLevels();
	  res.json({
		message: 'All unique levels',
		data: data
	  });
	} catch (err) {
	  console.error(err);
	  res.status(500).json({ error: 'Internal server error' });
	}
});  
router.get('/workways', async (req, res) => {
	try {
	  const data = await CrawlController.getAllWorkWays();
	  res.json({
		message: 'Work Ways',
		data: data
	  });
	} catch (err) {
	  console.error(err);
	  res.status(500).json({ error: 'Internal server error' });
	}
});
router.get('/education', async (req, res) => {
	try {
	  const data = await CrawlController.getAllEducation();
	  res.json({
		message: 'Education Levels',
		data: data
	  });
	} catch (err) {
	  console.error(err);
	  res.status(500).json({ error: 'Internal server error' });
	}
});
router.get('/experiences', async (req, res) => {
	try {
	  const data = await CrawlController.getAllExperiences();
	  res.json({
		message: 'Experience levels',
		data: data
	  });
	} catch (err) {
	  console.error(err);
	  res.status(500).json({ error: 'Internal server error' });
	}
});  
router.get('/source-picture', async (req, res) => {
  try {
    const { companyName } = req.query;
    if (!companyName) {
      return res.status(400).json({ error: 'Missing companyName query parameter' });
    }

    const sourcePicture = await CrawlController.getSourcePictureByCompanyName(companyName);
    if (!sourcePicture) {
      return res.status(404).json({ message: 'Source picture not found' });
    }

    res.json({ sourcePicture });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/cv/company/id/:id', CrawlController.getAllCVsByCompanyID);
router.get('/cv/applicant/id/:id', CrawlController.getAllCVsByApplicantID);
router.get('/cv/company/name/:name', CrawlController.getAllCVsByCompanyName);
router.put('/cv/status/:id', CrawlController.updateCVStatus);
router.put('/cv-submission/:id/message', async (req, res) => {
  const submissionId = req.params.id;
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  try {
    const result = await CrawlController.saveEmployerMessage(submissionId, message);
    if (result === 0) {
      return res.status(404).json({ error: 'CV submission not found' });
    }
    res.json({ message: 'Employer message saved successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/user-skill', async (req, res) => {
  try {
    const createdSkill = await CrawlController.createUserSkill(req.body);
    res.status(201).json({ message: "User skill created", data: createdSkill });
  } catch (err) {
    console.error("Error creating user skill:", err);
    res.status(500).json({ error: "Failed to create user skill" });
  }
});

// Get user skills by user ID
router.get('/user-skill/:user_id', async (req, res) => {
  try {
    const user_id = req.params.user_id;
    const skills = await CrawlController.getUserSkillsByUserId(user_id);
    res.status(200).json(skills);
  } catch (err) {
    console.error("Error getting user skills:", err);
    res.status(500).json({ error: "Failed to get user skills" });
  }
});

// Save a post
router.post('/save-post', async (req, res) => {
  try {
    const saved = await CrawlController.savePost(req.body);
    res.status(201).json({ message: "Post saved successfully", data: saved });
  } catch (err) {
    console.error("Error saving post:", err);
    res.status(500).json({ error: "Failed to save post" });
  }
});

// Get all saved posts by user_id
router.get('/save-post/:user_id', async (req, res) => {
  try {
    const user_id = req.params.user_id;
    const posts = await CrawlController.getSavedPostsByUserId(user_id);
    res.status(200).json(posts);
  } catch (err) {
    console.error("Error getting saved posts:", err);
    res.status(500).json({ error: "Failed to get saved posts" });
  }
});

// Delete a saved post by post_id
router.delete('/save-post/:post_id', async (req, res) => {
  try {
    const { post_id } = req.params;
    const deleted = await CrawlController.deleteSavedPostByPostId(post_id);
    if (deleted) {
      res.status(200).json({ message: "Saved post deleted successfully" });
    } else {
      res.status(404).json({ message: "Saved post not found" });
    }
  } catch (err) {
    console.error("Error deleting saved post:", err);
    res.status(500).json({ error: "Failed to delete saved post" });
  }
});

// D:\SANG\Do An Tot Nghiep\WEB-THAMKHAO\JOBINFOR\QLVLBackEnd\routes\datacrawl.js
router.post('/jobs', async (req, res) => {
  try {
    const jobData = req.body;
    const newJob = await CrawlController.createJob(jobData);
    res.status(201).json({
      message: 'Job created successfully',
      data: newJob
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/jobs/user/:user_id', async (req, res) => {
  const user_id = req.params.user_id;
  try {
    const jobs = await CrawlController.fetchJobsByUser(user_id);
    res.json(jobs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/industry-fields', async (req, res) => {
  try {
    const industries = await CrawlController.getIndustryFields();
    res.json(industries);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to get industry fields' });
  }
});

// const axios = require("axios");
// const getNgrokPublicUrl = require("./ngrokUrlFetcher"); // ✅ Correct relative path

// router.get("/proxy/professions", async (req, res) => {
//   try {
//     const ngrokUrl = await getNgrokPublicUrl();
//     console.log("✅ Ngrok public URL:", ngrokUrl);

//     if (!ngrokUrl) {
//       console.error("❌ Ngrok URL not found");
//       return res.status(500).json({ error: "Ngrok URL not found" });
//     }

//     const fullUrl = `${ngrokUrl}/app/professions`;
//     console.log("🌐 Calling:", fullUrl);

//     const response = await axios.get(fullUrl);
//     console.log("✅ Response from Ngrok:", response.data);
//     return res.json(response.data);
//   } catch (error) {
//     console.error("❌ Axios error:", {
//       message: error.message,
//       status: error.response?.status,
//       data: error.response?.data,
//     });
//     return res.status(500).json({ error: "Failed to fetch from Ngrok" });
//   }
// });

const axios = require('axios');
const getNgrokPublicUrl = require("./ngrokUrlFetcher");
router.use(bodyParser.json());

async function proxyNgrokGet(endpoint, res, query = {}) {
  try {
    const ngrokUrl = await getNgrokPublicUrl();
    if (!ngrokUrl) return res.status(500).json({ error: "Ngrok URL not found" });

    const fullUrl = `${ngrokUrl}/app${endpoint}`;
    const response = await axios.get(fullUrl, { params: query });
    return res.json(response.data);
  } catch (error) {
    console.error("Axios error:", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });
    return res.status(500).json({ error: "Failed to fetch from Ngrok" });
  }
}

async function proxyNgrokPost(endpoint, body, res) {
  try {
    const ngrokUrl = await getNgrokPublicUrl();
    const fullUrl = `${ngrokUrl}/app${endpoint}`;
    const response = await axios.post(fullUrl, body);
    return res.json(response.data);
  } catch (error) {
    console.error("POST Axios error:", error.message);
    return res.status(500).json({ error: "Failed to post to Ngrok" });
  }
}

async function proxyNgrokPut(endpoint, body, res) {
  try {
    const ngrokUrl = await getNgrokPublicUrl();
    const fullUrl = `${ngrokUrl}/app${endpoint}`;
    const response = await axios.put(fullUrl, body);
    return res.json(response.data);
  } catch (error) {
    console.error("PUT Axios error:", error.message);
    return res.status(500).json({ error: "Failed to update via Ngrok" });
  }
}

// ========== GET Routes ========== //
router.get('/proxy/dataCrawl', (req, res) => proxyNgrokGet('/dataCrawl', res));
router.get('/proxy/dataCrawl/:id', (req, res) => proxyNgrokGet(`/dataCrawl/${req.params.id}`, res));
router.get('/proxy/jobtitle', (req, res) => proxyNgrokGet('/jobtitle', res));
router.get('/proxy/filterjob', (req, res) => proxyNgrokGet('/filterjob', res, req.query));
router.get('/proxy/jobs-by-user/:user_id', (req, res) => proxyNgrokGet(`/jobs-by-user/${req.params.user_id}`, res));
router.get('/proxy/jobs-by-job/:job_id', (req, res) => proxyNgrokGet(`/jobs-by-job/${req.params.job_id}`, res));
router.get('/proxy/professions', (req, res) => proxyNgrokGet('/professions', res));
router.get('/proxy/levels', (req, res) => proxyNgrokGet('/levels', res));
router.get('/proxy/workways', (req, res) => proxyNgrokGet('/workways', res));
router.get('/proxy/education', (req, res) => proxyNgrokGet('/education', res));
router.get('/proxy/experiences', (req, res) => proxyNgrokGet('/experiences', res));
router.get('/proxy/source-picture', (req, res) => proxyNgrokGet('/source-picture', res, req.query));
router.get('/proxy/cv/company/id/:id', (req, res) => proxyNgrokGet(`/cv/company/id/${req.params.id}`, res));
router.get('/proxy/cv/applicant/id/:id', (req, res) => proxyNgrokGet(`/cv/applicant/id/${req.params.id}`, res));
router.get('/proxy/cv/company/name/:name', (req, res) => proxyNgrokGet(`/cv/company/name/${req.params.name}`, res));
router.get('/proxy/user-skill/:user_id', (req, res) => proxyNgrokGet(`/user-skill/${req.params.user_id}`, res));
router.get('/proxy/save-post/:user_id', (req, res) => proxyNgrokGet(`/save-post/${req.params.user_id}`, res));
router.get('/proxy/jobs/user/:user_id', (req, res) => proxyNgrokGet(`/jobs/user/${req.params.user_id}`, res));
router.get('/proxy/industry-fields', (req, res) => proxyNgrokGet('/industry-fields', res));

// ========== POST Routes ========== //
router.post('/proxy/user-skill', (req, res) => proxyNgrokPost('/user-skill', req.body, res));
router.post('/proxy/save-post', (req, res) => proxyNgrokPost('/save-post', req.body, res));
router.post('/proxy/jobs', (req, res) => proxyNgrokPost('/jobs', req.body, res));

// ========== PUT Routes ========== //
router.put('/proxy/updatejob/:id', (req, res) => proxyNgrokPut(`/updatejob/${req.params.id}`, req.body, res));
router.put('/proxy/cv/status/:id', (req, res) => proxyNgrokPut(`/cv/status/${req.params.id}`, req.body, res));
router.put('/proxy/cv-submission/:id/message', (req, res) => proxyNgrokPut(`/cv-submission/${req.params.id}/message`, req.body, res));

// ========== DELETE Routes ========== //
router.delete('/proxy/save-post/:post_id', async (req, res) => {
  try {
    const ngrokUrl = await getNgrokPublicUrl();
    const fullUrl = `${ngrokUrl}/app/save-post/${req.params.post_id}`;
    const response = await axios.delete(fullUrl);
    return res.json(response.data);
  } catch (error) {
    console.error("DELETE Axios error:", error.message);
    return res.status(500).json({ error: "Failed to delete from Ngrok" });
  }
});

module.exports = router;
