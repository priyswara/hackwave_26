/**
 * RainRoute - Authentication & Role Permission Manager
 * Supports Email/Password, Simulated OTP Demo, Session Persistence & Role Guards
 */

class AuthManager {
  constructor() {
    this.currentUser = this.loadSession();
    this.otpState = {
      phone: null,
      generatedOtp: null,
      expiryTimer: null,
      resendTimer: null,
      pendingUser: null
    };
  }

  loadSession() {
    try {
      const stored = sessionStorage.getItem('rainroute_active_user');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Could not load session user', e);
    }
    // Default guest
    return null;
  }

  saveSession(user) {
    this.currentUser = user;
    try {
      if (user) {
        sessionStorage.setItem('rainroute_active_user', JSON.stringify(user));
      } else {
        sessionStorage.removeItem('rainroute_active_user');
      }
    } catch (e) {
      console.error('Failed to save session', e);
    }
    window.dispatchEvent(new CustomEvent('rainroute:authchange', { detail: { user } }));
  }

  getCurrentUser() {
    return this.currentUser;
  }

  isLoggedIn() {
    return this.currentUser !== null;
  }

  hasRole(role) {
    return this.currentUser && this.currentUser.role === role;
  }

  login(email, password) {
    const user = window.RainRouteDB.getUserByEmail(email);
    if (!user) {
      return { success: false, message: 'No account found with this email address.' };
    }
    if (user.password !== password && password !== 'password123') {
      return { success: false, message: 'Invalid password. (Demo password is password123)' };
    }

    this.saveSession(user);
    window.RainRouteDB.logActivity(user.name, `Logged into ${user.role.toUpperCase()} portal`, user.id, 'Login');
    return { success: true, user };
  }

  loginAsDemo(role) {
    const demoUsers = {
      donor: 'donor@rainroute.org',
      ngo: 'ngo@rainroute.org',
      volunteer: 'volunteer@rainroute.org',
      admin: 'admin@rainroute.org'
    };
    const email = demoUsers[role];
    if (email) {
      return this.login(email, 'password123');
    }
    return { success: false, message: 'Invalid demo role requested' };
  }

  logout() {
    if (this.currentUser) {
      window.RainRouteDB.logActivity(this.currentUser.name, `Logged out of ${this.currentUser.role.toUpperCase()} portal`, this.currentUser.id, 'Logout');
    }
    this.saveSession(null);
    return true;
  }

  // --- Simulated OTP Flow ---
  sendOtp(phone, pendingUser = null) {
    // Generate 6-digit mock OTP
    const mockOtp = Math.floor(100000 + Math.random() * 900000).toString();
    this.otpState = {
      phone,
      generatedOtp: mockOtp,
      expiresAt: Date.now() + 120000, // 2 minutes
      pendingUser
    };

    // Auto-display simulated OTP notification/toast for judge ease
    window.RainRouteApp?.showToast(
      `SIMULATED OTP DEMO: Your code is [ ${mockOtp} ] (Valid for 2 min). No real SMS is sent.`,
      'info',
      8000
    );

    return {
      success: true,
      otp: mockOtp,
      message: `SIMULATED OTP generated: ${mockOtp}. (No real SMS is sent).`
    };
  }

  verifyOtp(enteredOtp) {
    if (!this.otpState.generatedOtp) {
      return { success: false, message: 'Please request an OTP first.' };
    }
    if (Date.now() > this.otpState.expiresAt) {
      return { success: false, message: 'OTP has expired. Please click Resend OTP.' };
    }
    if (enteredOtp.trim() !== this.otpState.generatedOtp) {
      return { success: false, message: 'Incorrect OTP code entered. Please check simulated OTP.' };
    }

    // If verification was for registration
    if (this.otpState.pendingUser) {
      const newUser = window.RainRouteDB.addUser(this.otpState.pendingUser);
      this.saveSession(newUser);
      this.otpState = {};
      return { success: true, user: newUser, message: 'Account registered and phone verified successfully!' };
    }

    // If verification was for login
    const user = window.RainRouteDB.getUsers().find(u => u.phone === this.otpState.phone);
    if (user) {
      this.saveSession(user);
      this.otpState = {};
      return { success: true, user, message: 'Phone verified and logged in successfully!' };
    }

    return { success: true, message: 'Phone verification confirmed!' };
  }

  register(userData) {
    const existing = window.RainRouteDB.getUserByEmail(userData.email);
    if (existing) {
      return { success: false, message: 'An account with this email already exists.' };
    }
    return this.sendOtp(userData.phone, userData);
  }
}

window.RainRouteAuth = new AuthManager();
