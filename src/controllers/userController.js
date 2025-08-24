import User from '../models/User.js';

export const getAllUsers = async (req, res) => {
    try {
        const q = (req.query.q || '').trim();
        const filter = q
            ? { $or: [{ username: { $regex: q, $options: 'i' } }, { email: { $regex: q, $options: 'i' } }] }
            : {};
        const users = await User.find(filter).select('-password');
        res.json({data : users});
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
