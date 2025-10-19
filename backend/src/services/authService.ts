import { User, IUser } from '../models/User';
import { hashPassword, comparePassword } from '../utils/password';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt';
import { BadRequestError, UnauthorizedError, ConflictError } from '../utils/errors';

interface SignupData {
  email: string;
  password: string;
  name: string;
}

interface LoginData {
  email: string;
  password: string;
}

interface UpdateProfileData {
  name?: string;
  bio?: string;
  avatarUrl?: string;
}

/**
 * Register a new user account
 */
export async function register(data: SignupData): Promise<{
  user: IUser;
  accessToken: string;
  refreshToken: string;
}> {
  const { email, password, name } = data;

  // Check if user already exists
  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    throw new ConflictError('Email already exists');
  }

  // Hash password
  const hashedPassword = await hashPassword(password);

  // Create user
  const user = await User.create({
    email: email.toLowerCase(),
    password: hashedPassword,
    name,
    bio: '',
    avatarUrl: '',
    albumCount: 0,
  });

  // Generate tokens
  const accessToken = generateAccessToken(user._id.toString(), user.email);
  const refreshToken = generateRefreshToken(user._id.toString(), user.email);

  return { user, accessToken, refreshToken };
}

/**
 * Login with email and password
 */
export async function login(data: LoginData): Promise<{
  user: IUser;
  accessToken: string;
  refreshToken: string;
}> {
  const { email, password } = data;

  // Find user with password field (normally excluded by select: false)
  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  if (!user) {
    throw new UnauthorizedError('Invalid email or password');
  }

  // Verify password
  const isPasswordValid = await comparePassword(password, user.password);
  if (!isPasswordValid) {
    throw new UnauthorizedError('Invalid email or password');
  }

  // Generate tokens
  const accessToken = generateAccessToken(user._id.toString(), user.email);
  const refreshToken = generateRefreshToken(user._id.toString(), user.email);

  return { user, accessToken, refreshToken };
}

/**
 * Get user by ID
 */
export async function getUserById(userId: string): Promise<IUser | null> {
  return User.findById(userId);
}

/**
 * Update user profile
 */
export async function updateProfile(
  userId: string,
  data: UpdateProfileData
): Promise<IUser | null> {
  // Validate data
  if (data.name !== undefined && (data.name.length < 2 || data.name.length > 100)) {
    throw new BadRequestError('Name must be between 2 and 100 characters');
  }

  if (data.bio !== undefined && data.bio.length > 1000) {
    throw new BadRequestError('Bio must be at most 1000 characters');
  }

  // Update user
  const user = await User.findByIdAndUpdate(
    userId,
    { $set: data },
    { new: true, runValidators: true }
  );

  return user;
}
