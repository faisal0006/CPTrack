import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import userRepository from '../repositories/UserRepository';

class AuthService {
    async registerUser(data: any) {
        const { name, email, password } = data;
        
        let user = await userRepository.findByEmail(email);
        if (user) {
            throw new Error('User already exists');
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        user = await userRepository.save({
            name,
            email,
            password: hashedPassword
        });

        const token = this.generateToken(user._id);
        
        return {
            _id: user._id,
            name: user.name,
            email: user.email,
            token
        };
    }

    async authenticateUser(data: any) {
        const { email, password } = data;

        const user = await userRepository.findByEmail(email);
        if (!user) {
            throw new Error('Invalid credentials');
        }

        const isMatch = await bcrypt.compare(password, user.password as string);
        if (!isMatch) {
            throw new Error('Invalid credentials');
        }

        const token = this.generateToken(user._id);

        return {
            _id: user._id,
            name: user.name,
            email: user.email,
            token
        };
    }

    generateToken(id) {
        return jwt.sign({ id }, process.env.JWT_SECRET as string, {
            expiresIn: '30d'
        });
    }
}

export default new AuthService();
