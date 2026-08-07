import { AuthService } from "../../services/auth.service";
import { TokenService } from "../../services/token.service";
import {
  ConflictError,
  UnauthorizedError,
  ValidationError,
} from "../../utils/errors";
import { mockUserId } from "../helpers/mockData";
import { createMockUserRepository } from "../helpers/mockRepository";

// Mock the entire TokenService
// We don't want to test JWT signing here — just that the service
// calls it correctly

jest.mock("../../services/token.service");

describe("AuthService", () => {
  let authService: AuthService;
  let mockUserRepo: ReturnType<typeof createMockUserRepository>;
  let mockTokenService: jest.Mocked<TokenService>;

  beforeEach(() => {
    mockUserRepo = createMockUserRepository();
    mockTokenService = new TokenService() as jest.Mocked<TokenService>;
    mockTokenService.generateTokenPair = jest.fn().mockReturnValue({
      accessToken: "mocked.access.token",
      refreshToken: "mocked.refresh.token",
      refreshTokenJti: "mocked-jti-uuid",
    });
    authService = new AuthService(mockUserRepo, mockTokenService);
  });

  // Register
  describe("register", () => {
    const validData = {
      email: "test@example.com",
      username: "testuser",
      password: "Password123",
    };

    it("creates a user and returns an auth response", async () => {
      mockUserRepo.emailExists.mockResolvedValue(false);
      mockUserRepo.create.mockResolvedValue({
        _id: mockUserId,
        email: "test@example.com",
        username: "testuser",
        passwordHash: "hashed",
        createdAt: new Date(),
        updatedAt: new Date(),
        comparePassword: jest.fn(),
      } as any);

      const result = await authService.register(validData);

      expect(result.token).toBe("mocked.access.token");
      expect(result.user.email).toBe("test@example.com");
    });

    it("throws ConflictError when email already exists", async () => {
      mockUserRepo.emailExists.mockResolvedValue(true);

      await expect(authService.register(validData)).rejects.toThrow(
        ConflictError,
      );
    });

    it("throws ConflictError with descriptive message", async () => {
      mockUserRepo.emailExists.mockResolvedValue(true);

      await expect(authService.register(validData)).rejects.toThrow(
        "An account with this email already exists",
      );
    });

    it("throws ValidationError when email is missing", async () => {
      await expect(
        authService.register({ ...validData, email: "" }),
      ).rejects.toThrow(ValidationError);
    });

    it("throws ValidationError when password is missing", async () => {
      await expect(
        authService.register({ ...validData, password: "short" }),
      ).rejects.toThrow(ValidationError);
    });

    it("does not create user if email already exists", async () => {
      mockUserRepo.emailExists.mockResolvedValue(true);

      await expect(authService.register(validData)).rejects.toThrow();

      // Repository create should never be called
      expect(mockUserRepo.create).not.toHaveBeenCalled();
    });
  });

  // Login
  describe("login", () => {
    const mockUserDoc = {
      _id: mockUserId,
      email: "test@example.com",
      username: "testuser",
      passwordHash: "hashed",
      createdAt: new Date(),
      updatedAt: new Date(),
      comparePassword: jest.fn().mockResolvedValue(true),
    };

    it("returns auth response on valid credentials", async () => {
      mockUserRepo.findByEmail.mockResolvedValue(mockUserDoc as any);

      const result = await authService.login({
        email: "test@example.com",
        password: "Password123",
      });

      expect(result.token).toBe("mocked.access.token");
      expect(result.user.email).toBe("test@example.com");
    });

    it("throws UnauthorizedError when user not found", async () => {
      mockUserRepo.findByEmail.mockResolvedValue(null);

      await expect(
        authService.login({
          email: "wrong@example.com",
          password: "Password123",
        }),
      ).rejects.toThrow(UnauthorizedError);
    });

    it("throws UnauthorizedError when password is wrong", async () => {
      mockUserRepo.findByEmail.mockResolvedValue({
        ...mockUserDoc,
        comparePassword: jest.fn().mockResolvedValue(false),
      } as any);

      await expect(
        authService.login({
          email: "test@example.com",
          password: "wrongpassword",
        }),
      ).rejects.toThrow(UnauthorizedError);
    });

    it("returns same error for wrong email and wrong password", async () => {
      // Security: both cases must return identical error message
      mockUserRepo.findByEmail.mockResolvedValue(null);
      const emailError = await authService
        .login({
          email: "wrong@example.com",
          password: "Password123",
        })
        .catch((e) => e);

      mockUserRepo.findByEmail.mockResolvedValue({
        ...mockUserDoc,
        comparePassword: jest.fn().mockResolvedValue(false),
      } as any);
      const passwordError = await authService
        .login({
          email: "test@example.com",
          password: "wrongpassword",
        })
        .catch((e) => e);

      expect(emailError.message).toBe(passwordError.message);
    });
  });
});
