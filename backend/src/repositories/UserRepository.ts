import User from '../models/User';

class UserRepository {
    async save(userData: any) {
        const user = new User(userData);
        return await user.save();
    }

    async findByEmail(email: any) {
        return await User.findOne({ email });
    }

    async findById(id: any) {
        return await User.findById(id).select('-password');
    }

    async update(id: any, updateData: any) {
        return await User.findByIdAndUpdate(id, updateData, { new: true }).select('-password');
    }
}

export default new UserRepository();
