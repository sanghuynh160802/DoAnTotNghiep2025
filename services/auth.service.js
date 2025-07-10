const TokenService = require('./token.service');
const UserController = require('../controllers/user.Controller');
const mailService  = require('../services/mailService');
const dotenv = require('dotenv');
dotenv.config();
const { generateUUID } = require('../utils/uuid');
// const loginUserWithEmailAndPassword = async (email, password) => {
// 	const user = await UserController.getUserByEmail(email);
// 	console.log("userDB",user)
// 	if (!user){
// 		return null;
// 	}
// 	const passwordHashed = TokenService.hashPasswordWithSalt(password, process.env.SALT);
// 	if (user.password == passwordHashed.password){
// 		return {
// 			id: user.id,
// 			email : user.email,
// 			name : user.name,
// 			avatar: user.avatar,
// 			role: user.role
// 		}
// 	}
// }

const loginUserWithEmailAndPassword = async (email, password) => {
	const user = await UserController.getUserByEmail(email);
	console.log("userDB", user);

	if (!user) {
		return null;
	}

	// 🚨 Direct string comparison of two hashed passwords
	if (user.password === password) {
		return {
			id: user.id,
			email: user.email,
			name: user.name,
			avatar: user.avatar,
			role: user.role
		};
	}

	return null;
};
const resetPassword = async (email, password) => { 
	try {
		const user = await UserController.getUserByEmail(email);
		if (!user){
			return null;
		}
		const hashedPassword = TokenService.hashPasswordWithSalt(password, process.env.SALT );
		user.password = hashedPassword.password;
		user.isVerified = 0;
		const updatedUser = await UserController.updateUser(user.id, user);
		return updatedUser;
	} catch (error) {
		throw new Error(error.message || 'Internal server error');
	}
}
const forgotpassWord = async (email) => { 
	try {
		const user = await UserController.getUserByEmail(email);
		if (!user){
			return null;
		}
		const token = TokenService.forgotpasswordToken(user);
		console.log(token)
		const mailOptions = {
			emailFrom: "tansanghuynhnguyen@gmail.com",
			emailTo: email,
			subject: 'Reset password',
			text:  `Click this link to reset your password: http://wandertour.ddns.net:5173/resetpassword?token=${token}`,
		}
		const mail = await mailService.sendEmail(mailOptions);
		user.isverified = 'true';
		const updatedUser = await UserController.updateUser(user.id, user);
		return mail, updatedUser;
	} catch (error) {
		throw new Error(error.message || 'Internal server error');
	}
}

const register = async (user) => {
	try {
		const hashedPassword = TokenService.hashPasswordWithSalt(user.password, process.env.SALT);
		const now = new Date().toISOString().slice(0, 19).replace('T', ' ');

		const newUser = {
			id: generateUUID(),
			name: user.name,
			email: user.email,
			password: hashedPassword.password,
			salt: hashedPassword.password, // ⬅️ Same as password
			user_type: user.user_type || "APPLICANT",
			avatar: "http://localhost:3009/public/user_icon.png",
			age: user.age,
			isVerified: Math.random() < 0.5 ? 0 : 1, // ⬅️ Random 0 or 1
			role: "USER",
			created_at: now,
			updated_at: now
		};

		await UserController.createUser(newUser);
		return newUser;
	} catch (error) {
		throw new Error(error.message || 'Internal server error');
	}
};

const updateUserInfo = async (id, user) => {
	try {
		const updatedUser = await UserController.updateUser(id, user);
		return updatedUser;
	} catch (error) {
		throw new Error(error.message || 'Internal server error');
	}
}
const deleteUser = async (id) => {
	try {
		const deletedUser = await UserController.deleteUser(id);
		return deletedUser;
	} catch (error) {
		throw new Error(error.message || 'Internal server error');
	}
}
module.exports = {
	loginUserWithEmailAndPassword,
	register,
	updateUserInfo,
	deleteUser,
	forgotpassWord,
	resetPassword
}
