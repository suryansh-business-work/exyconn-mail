import jwt from "jsonwebtoken";
import User, { IUser } from "./user.model";
import config from "../../config/index";
import { RegisterDto, LoginDto, TokenPayload } from "./auth.validators";

export class AuthService {
  async register(
    dto: RegisterDto,
  ): Promise<{ user: IUser; accessToken: string; refreshToken: string }> {
    const existingUser = await User.findOne({ email: dto.email.toLowerCase() });
    if (existingUser) {
      throw new Error("User with this email already exists");
    }

    const user = new User({
      email: dto.email.toLowerCase(),
      password: dto.password,
      name: dto.name,
      role: "user",
    });

    await user.save();

    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);

    return { user, accessToken, refreshToken };
  }

  async login(
    dto: LoginDto,
  ): Promise<{ user: IUser; accessToken: string; refreshToken: string }> {
    const user = await User.findOne({ email: dto.email.toLowerCase() });
    if (!user) {
      throw new Error("Invalid email or password");
    }

    if (!user.isActive) {
      throw new Error("Account is deactivated");
    }

    const isMatch = await user.comparePassword(dto.password);
    if (!isMatch) {
      throw new Error("Invalid email or password");
    }

    user.lastLogin = new Date();
    await user.save();

    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);

    return { user, accessToken, refreshToken };
  }

  async refreshToken(
    token: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      const payload = jwt.verify(
        token,
        config.jwtRefreshSecret,
      ) as TokenPayload;
      const user = await User.findById(payload.userId);

      if (!user || !user.isActive) {
        throw new Error("User not found or inactive");
      }

      const accessToken = this.generateAccessToken(user);
      const refreshToken = this.generateRefreshToken(user);

      return { accessToken, refreshToken };
    } catch {
      throw new Error("Invalid refresh token");
    }
  }

  async getProfile(userId: string): Promise<IUser> {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }
    return user;
  }

  async updateRole(userId: string, role: string): Promise<IUser> {
    const user = await User.findByIdAndUpdate(userId, { role }, { new: true });
    if (!user) {
      throw new Error("User not found");
    }
    return user;
  }

  private generateAccessToken(user: IUser): string {
    const payload: TokenPayload = {
      userId: String(user._id),
      email: user.email,
      role: user.role,
    };
    return jwt.sign(payload, config.jwtSecret, {
      expiresIn: config.jwtExpiresIn,
    } as jwt.SignOptions);
  }

  private generateRefreshToken(user: IUser): string {
    const payload: TokenPayload = {
      userId: String(user._id),
      email: user.email,
      role: user.role,
    };
    return jwt.sign(payload, config.jwtRefreshSecret, {
      expiresIn: config.jwtRefreshExpiresIn,
    } as jwt.SignOptions);
  }
}

export default new AuthService();
