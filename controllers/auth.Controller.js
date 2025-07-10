const AuthServices = require('../services/auth.service');
const TokenService = require('../services/token.service');
const mailService  = require('../services/mailService');
const UserController = require('./user.Controller');
const login = async (req, res) => {
	try {
		console.log("🔍 Login Body:", req.body); // <-- Add this

		const { email, password } = req.body;
		const user = await AuthServices.loginUserWithEmailAndPassword(email, password);

		if (!user) {
			return res.status(400).json({ 
				data: { message: 'Email or password not correct' }
			});
		}

		const access_token = await TokenService.signToken(user);
		const refresh_token = await TokenService.refreshToken(user);

		res.send({
			data: {
				user,
				access_token,
				refresh_token
			},
			message: 'Login success'
		});
	} catch (e) {
		console.error("❌ Login Error:", e);
		res.status(500).json({ message: e.message || 'Internal server error' });
	}
};
const resetPassword = async (req, res) => { 
	try {
		const { email, password } = req.body;
		const user = await AuthServices.resetPassword(email, password);
		if (!user) {
			res.status(400).json({ message: 'Email not found'});
			return;
		}
		res.status(200).json({ message: 'Reset password success'});
	} catch (error) {
		console.log(error);
		res.status(500).json({ message: error.message || 'Internal server error'});
	}

}
const forgotpassWord = async (req, res) => {
	try {
		const { email } = req.body;
		const user = await AuthServices.forgotpassWord(email);
		if (!user) {
			res.status(400).json({ message: 'Email not found'});
			return;
		}
		res.status(200).json({ message: 'Please check your email to reset password'});
	} catch (error) {
		console.log(error);
		res.status(500).json({ message: error.message || 'Internal server error'});
	}

}

const register = async (req, res) => {
	try {
		const user = req.body;
		const newUser = await AuthServices.register(user);
		res.status(201).json({
			status: "Success",
			data: {
				id: newUser.id,
				name: newUser.name,
				email: newUser.email,
				user_type: newUser.user_type,
				avatar: newUser.avatar,
				age: newUser.age,
				isVerified: newUser.isVerified, // ⬅️ Include new field
				created_at: newUser.created_at,
				updated_at: newUser.updated_at
			}
		});
	} catch (error) {
		console.log(error);
		res.status(500).json({ message: error.message || 'Internal server error' });
	}
};

const updateUserInfo = async (req, res) => {
	try {
		const id = req.params.id;
		const user = req.body;
		console.log(user);
		const updatedUser = await AuthServices.updateUserInfo(id, user);
		res.status(201).json(
			{
				status: "Success",
				data: {
					name: updatedUser.name,
					email: updatedUser.email,
					age: updatedUser.age
				}
			}
		)
	} catch (error) {
		console.log(error);
		res.status(500).json({ message: error.message || 'Internal server error'});
	}
}
const deleteUser = async (req, res) => {
	try {
		const id = req.params.id;
		const user = await AuthServices.deleteUser(id);
		console.log(user)
		res.status(201).json(
			{
				status: "Delete success",
			}
		)
	} catch (error) {
		console.log(error);
		res.status(500).json({ message: error.message || 'Internal server error'});
	}
}
// const sendMail = async (req, res) => {
// 	const sendEmail = req.body;

// 	try {
// 		const mailOptions = {
// 			emailFrom: "tansanghuynhnguyen@gmail.com",
// 			emailTo: sendEmail.mailTo,
// 			subject: "Here is your job link",
// 			text: `Click here:${sendEmail.link}`
			
// 		};
// 		try {
// 			await mailService.sendEmail(mailOptions);
// 			return res.status(201).send({ message: 'Email sent successfully' });
// 		}
// 		catch (error) {
// 			console.log(error);
// 			return res.status(500).send({ message: 'Failed to send email' || 'Internal server error'});
// 		}
// 	}
// 	catch (error) {
// 		console.log(error);
// 	}
// }
const sendMail = async (req, res) => {
	try {
	  const {
		applicant_id,
		company_id,
		job_id,
		applicant_email,
		applicant_phone,
		title,
		company_name,
		cv_content_base64, // base64 encoded string
		cv_filename,       // <-- ADD THIS
		cv_mimetype        // <-- AND THIS
	  } = req.body;
  
	  if (
		!applicant_id || !company_id || !job_id || !applicant_email || !cv_content_base64 ||
		!title || !company_name
	  ) {
		return res.status(400).json({ message: "Missing required fields" });
	  }
  
	  const result = await mailService.sendEmail({
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
	  });
  
	  res.status(201).json({
		status: "Success",
		message: "CV submission saved successfully.",
		data: result
	  });
	} catch (error) {
	  console.error("sendMail error:", error);
	  res.status(500).json({
		message: "Failed to send mail or save submission.",
		error: error.message
	  });
	}
};  
const refreshToken = async (req, res) => { 
	try {
		const token = req.body.refresh_token;
		// console.log(token)
		if (token) {
			const response = await TokenService.refreshTokenService(token)
			return res.status(201).json({
				access_token: response
			});
		} else {
			return res.status(400).json({ message: 'The refresh token is not valid' });
		}
	} catch (error) {
		console.log(error);
		return res.status(500).json({ message: error.message || 'Internal server error'});
	}
}
  
module.exports = {
	login,
	register,
	updateUserInfo,
	deleteUser,
	sendMail,
	refreshToken,
	forgotpassWord,
	resetPassword,
};  