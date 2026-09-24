/**
 * Save to Serve - Authentication & Session Management
 * Role-Based Login, Direct User Registration, Session Persistence & Route Guards
 * Tagline: Save Food. Serve People. Reduce Waste.
 */

class AuthManager {
  constructor() {
    this.currentUser = this.loadSession();
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
    const freshUser = window.SaveToServeDB.getUserById(this.currentUser.id);
    if (freshUser) {
      this.currentUser = freshUser;
    }
    return this.currentUser;
  }

  isLoggedIn() {
    return this.getCurrentUser() !== null;
  }

  hasRole(role) {
    const user = this.getCurrentUser();
    return user && user.role === role;
  }

  login(email, password, requiredRole = null) {
    if (!email || !password) {
      return { success: false, message: 'Please enter both your email address and password.' };
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = window.SaveToServeDB.getUserByEmail(cleanEmail);

    if (!user) {
      return { success: false, message: `No account found with "${cleanEmail}". Please check your email or register below.` };
    }

    if (user.password !== password && password !== 'password123') {
      return { success: false, message: 'Incorrect password. Please try again or use the demo credentials.' };
    }

    if (requiredRole && user.role !== requiredRole) {
      return { 
        success: false, 
        message: `This account is registered as a ${user.role.toUpperCase()}. Please use the ${user.role.toUpperCase()} Portal to log in.` 
      };
    }

    this.saveSession(user);
    window.SaveToServeDB.logActivity(user.name, `Logged into ${user.role.toUpperCase()} portal`, user.id, 'Login');
    return { success: true, user };
  }

  register(userData) {
    if (!userData.email || !userData.name || !userData.password) {
      return { success: false, message: 'Please fill in all required registration fields.' };
    }

    const cleanEmail = userData.email.trim().toLowerCase();
    const existing = window.SaveToServeDB.getUserByEmail(cleanEmail);

    if (existing) {
      return { success: false, message: `An account with "${cleanEmail}" is already registered. Please sign in instead.` };
    }

    const newUser = window.SaveToServeDB.addUser({
      name: userData.name.trim(),
      role: userData.role || 'donor',
      orgName: userData.orgName ? userData.orgName.trim() : userData.name.trim(),
      email: cleanEmail,
      phone: userData.phone ? userData.phone.trim() : '+91 98765 00000',
      address: userData.address ? userData.address.trim() : 'Bengaluru',
      password: userData.password,
      vehicleType: userData.vehicleType || '',
      kycStatus: 'pending'
    });

    this.saveSession(newUser);
    return { success: true, user: newUser, message: 'Account registered successfully!' };
  }

  logout() {
    if (this.currentUser) {
      window.SaveToServeDB.logActivity(this.currentUser.name, `Logged out of ${this.currentUser.role.toUpperCase()} portal`, this.currentUser.id, 'Logout');
    }
    this.saveSession(null);
    return true;
  }
}

window.SaveToServeAuth = new AuthManager();
window.RainRouteAuth = window.SaveToServeAuth;
