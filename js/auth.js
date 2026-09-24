/**
 * Save to Serve - Authentication & Role Permission Manager
 * Supports Email/Password, Simulated OTP Demo, Session Persistence & Role Guards
 * Tagline: Save Food. Serve People. Reduce Waste.
 */

class AuthManager {
  constructor() {
    this.currentUser = this.loadSession();
    this.otpState = {
      phone: null,
      generatedOtp: null,
      expiresAt: null,
      pendingUser: null
    };
  }

  loadSession() {
    try {
      const stored = sessionStorage.getItem('savetoserve_active_user') || sessionStorage.getItem('rainroute_active_user');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Could not load session user', e);
    }
    return null;
  }

  saveSession(user) {
    this.currentUser = user;
    try {
      if (user) {
        sessionStorage.setItem('savetoserve_active_user', JSON.stringify(user));
      } else {
        sessionStorage.removeItem('savetoserve_active_user');
        sessionStorage.removeItem('rainroute_active_user');
      }
    } catch (e) {
      console.error('Failed to save session', e);
    }
    window.dispatchEvent(new CustomEvent('savetoserve:authchange', { detail: { user } }));
  }

  getCurrentUser() {
    if (!this.currentUser) return null;
    // Always refresh user object from latest store to catch KYC status changes dynamically
    const freshUser = window.SaveToServeDB.getUserById(this.currentUser.id);
    if (freshUser) {
      this.currentUser = freshUser;
    }
    return this.currentUser;
  }

  isLoggedIn() {
    return this.currentUser !== null;
  }

  hasRole(role) {
    const user = this.getCurrentUser();
    return user && user.role === role;
  }

  login(email, password) {
    const user = window.SaveToServeDB.getUserByEmail(email);
    if (!user) {
      return { success: false, message: 'No account found with this email address.' };
    }
    if (user.password !== password && password !== 'password123') {
      return { success: false, message: 'Invalid password. (Demo password is password123)' };
    }

    this.saveSession(user);
    window.SaveToServeDB.logActivity(user.name, `Logged into ${user.role.toUpperCase()} portal`, user.id, 'Login');
    return { success: true, user };
  }

  loginAsDemo(role) {
    const demoUsers = {
      donor: 'donor@savetoserve.org',
      ngo: 'ngo@savetoserve.org',
      volunteer: 'volunteer@savetoserve.org',
      admin: 'admin@savetoserve.org'
    };
    const email = demoUsers[role];
    if (email) {
      return this.login(email, 'password123');
    }
    return { success: false, message: 'Invalid demo role requested' };
  }

  logout() {
    if (this.currentUser) {
      window.SaveToServeDB.logActivity(this.currentUser.name, `Logged out of ${this.currentUser.role.toUpperCase()} portal`, this.currentUser.id, 'Logout');
    }
    this.saveSession(null);
    return true;
  }

  // --- Simulated OTP Flow ---
  sendOtp(phone, pendingUser = null) {
    const mockOtp = Math.floor(100000 + Math.random() * 900000).toString();
    this.otpState = {
      phone,
      generatedOtp: mockOtp,
      expiresAt: Date.now() + 120000,
      pendingUser
    };

    window.SaveToServeApp?.showToast(
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

    if (this.otpState.pendingUser) {
      const newUser = window.SaveToServeDB.addUser(this.otpState.pendingUser);
      this.saveSession(newUser);
      this.otpState = {};
      return { success: true, user: newUser, message: 'Account registered and phone verified successfully!' };
    }

    const user = window.SaveToServeDB.getUsers().find(u => u.phone === this.otpState.phone);
    if (user) {
      this.saveSession(user);
      this.otpState = {};
      return { success: true, user, message: 'Phone verified and logged in successfully!' };
    }

    return { success: true, message: 'Phone verification confirmed!' };
  }

  register(userData) {
    const existing = window.SaveToServeDB.getUserByEmail(userData.email);
    if (existing) {
      return { success: false, message: 'An account with this email already exists.' };
    }
    return this.sendOtp(userData.phone, userData);
  }
}

window.SaveToServeAuth = new AuthManager();
window.RainRouteAuth = window.SaveToServeAuth;
