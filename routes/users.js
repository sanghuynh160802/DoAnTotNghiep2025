const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.Controller');
const AuthMiddleware = require('../middlewares/auth.middleware');
const TokenService = require('../services/token.service');
const bodyParser = require('body-parser')
router.use(bodyParser.json())
// Lấy danh sách người dùng
router.get('/', async (req, res) => {
	try {
		const users = await userController.getUsers();
		res.json(users);
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: 'Internal server error1' });
	}
});
router.get('/me',[AuthMiddleware.authorize], async (req, res) => {
	try {
		const user_id = TokenService.getInfoFromToken(req).id;
		console.log(user_id);
		const user = await userController.getUserById(user_id);
		if (user) {
			res.json(user);
		} else {
			res.status(404).json({ error: 'User not found' });
		}
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: 'Internal server error' });
	}
});

// Lấy thông tin người dùng theo ID
router.get('/:id', async (req, res) => {
	const userId = req.params.id;
	try {
		const user = await userController.getUserById(userId);
		if (user) {
			res.json(user);
		} else {
			res.status(404).json({ error: 'User not found' });
		}
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: 'Internal server error' });
	}
});

// Tạo người dùng mới
router.post('/', async (req, res) => {
	const newUser = req.body;
	try {
		console.log(newUser);
		await userController.createUser(newUser);
		res.status(201).json({ message: 'User created' });
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: 'Internal server error' });
	}
});

// Cập nhật thông tin người dùng
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const updatedUser = req.body;
  try {
    const user = await userController.getUserById(id);
    if (user) {
      await userController.updateUser(id, updatedUser);
      const updatedUserData = await userController.getUserById(id);
      res.json({ 
        message: 'User updated',
        data: updatedUserData
      });
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Xóa người dùng
router.delete('/:id',[AuthMiddleware.authorize], async (req, res) => {
	const userId = req.params.id;
	try {
		await userController.deleteUser(userId);
		res.json({ message: 'User deleted' });
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: 'Internal server error' });
	}
});

// Lấy ID người dùng theo tên
router.get('/get-id-by-name/:name', async (req, res) => {
	try {
	  const userName = decodeURIComponent(req.params.name);
	  const userId = await userController.getUserIdByName(userName);
	  if (userId !== null) {
		res.json({ id: userId });
	  } else {
		res.status(404).json({ error: 'User not found' });
	  }
	} catch (err) {
	  console.error(err);
	  res.status(500).json({ error: 'Internal server error' });
	}
  });  

module.exports = router;
