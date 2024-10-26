import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

export interface User {
  id: number;
  username: string;
}

export class AuthService {
  private static instance: AuthService;
  private token: string | null = null;

  private constructor() {
    this.token = localStorage.getItem('token');
  }

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  public async login(username: string, password: string): Promise<boolean> {
    try {
      const response = await axios.post(`${API_URL}/login`, { username, password });
      this.setToken(response.data.token);
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  }

  public async signup(username: string, password: string): Promise<boolean> {
    try {
      const response = await axios.post(`${API_URL}/signup`, { username, password });
      this.setToken(response.data.token);
      return true;
    } catch (error) {
      console.error('Signup error:', error);
      return false;
    }
  }

  public logout(): void {
    this.token = null;
    localStorage.removeItem('token');
  }

  public isAuthenticated(): boolean {
    return !!this.token;
  }

  public getToken(): string | null {
    return this.token;
  }

  private setToken(token: string): void {
    this.token = token;
    localStorage.setItem('token', token);
  }

  public getAuthHeaders() {
    return {
      headers: {
        Authorization: `Bearer ${this.token}`,
      },
    };
  }
}

export const useAuth = () => {
  const authService = AuthService.getInstance();

  return {
    login: authService.login.bind(authService),
    signup: authService.signup.bind(authService),
    logout: authService.logout.bind(authService),
    isAuthenticated: authService.isAuthenticated.bind(authService),
    getToken: authService.getToken.bind(authService),
    getAuthHeaders: authService.getAuthHeaders.bind(authService),
  };
};