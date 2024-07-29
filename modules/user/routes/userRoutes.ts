import express from 'express';
import userService from '../services/userService';

const router = express.Router();

router.get('/', async (req, res) => {
    const users = await userService.getAllUsers();
    res.json(users);
});

router.get('/:id', async (req, res) => {
    const user = await userService.getUserById(req.params.id);
    if (user) {
        res.json(user);
    } else {
        res.status(404).json({ error: 'User not found' });
    }
});

router.put('/:id', async (req, res) => {
    const user = await userService.updateUser(req.params.id, req.body);
    if (user) {
        res.json(user);
    } else {
        res.status(404).json({ error: 'User not found' });
    }
});

router.delete('/:id', async (req, res) => {
    const user = await userService.deleteUser(req.params.id);
    if (user) {
        res.json({ message: 'User deleted successfully' });
    } else {
        res.status(404).json({ error: 'User not found' });
    }
});

export default router;