import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: 'customer' | 'admin' | 'staff' | 'super_admin';
  isVerified: boolean;
  savedAddresses?: unknown[];
  profileImage?: string;
  avatar?: string;
  avatarUrl?: string;
  image?: string;
  photo?: string;
  gender?: string;
  dateOfBirth?: string | Date;
}

const normalizeUser = (user: any): User => {
  if (!user) return user;
  const userKey = user._id || user.email || user.id || 'user';
  let cachedAvatar = '';
  if (typeof window !== 'undefined') {
    try {
      cachedAvatar = localStorage.getItem(`charulata_avatar_${userKey}`) || '';
    } catch {}
  }
  const avatarImage =
    user.profileImage ||
    user.avatar ||
    user.avatarUrl ||
    user.image ||
    user.photo ||
    user.picture ||
    user.profilePicture ||
    cachedAvatar ||
    '';

  if (avatarImage && typeof window !== 'undefined') {
    try {
      localStorage.setItem(`charulata_avatar_${userKey}`, avatarImage);
    } catch {}
  }

  return {
    ...user,
    profileImage: avatarImage,
    avatar: avatarImage,
  };
};

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
}

const getInitialState = (): AuthState => {
  if (typeof window === 'undefined') {
    return {
      token: null,
      user: null,
      isAuthenticated: false,
    };
  }

  try {
    const token = localStorage.getItem('charulata_token');
    const userJson = localStorage.getItem('charulata_user');
    const rawUser = userJson ? JSON.parse(userJson) : null;
    const user = rawUser ? normalizeUser(rawUser) : null;

    return {
      token,
      user,
      isAuthenticated: !!token,
    };
  } catch (error) {
    console.error('Error reading auth state from localStorage:', error);
    return {
      token: null,
      user: null,
      isAuthenticated: false,
    };
  }
};

const authSlice = createSlice({
  name: 'auth',
  initialState: getInitialState(),
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ token: string; user: any }>
    ) => {
      const normalized = normalizeUser(action.payload.user);
      state.token = action.payload.token;
      state.user = normalized;
      state.isAuthenticated = true;
      if (typeof window !== 'undefined') {
        localStorage.setItem('charulata_token', action.payload.token);
        localStorage.setItem('charulata_user', JSON.stringify(normalized));
      }
    },
    updateUser: (state, action: PayloadAction<any>) => {
      const normalized = normalizeUser({ ...state.user, ...action.payload });
      state.user = normalized;
      if (typeof window !== 'undefined') {
        localStorage.setItem('charulata_user', JSON.stringify(normalized));
      }
    },
    logout: (state) => {
      state.token = null;
      state.user = null;
      state.isAuthenticated = false;
      if (typeof window !== 'undefined') {
        localStorage.removeItem('charulata_token');
        localStorage.removeItem('charulata_user');
      }
    },
  },
});

export const { setCredentials, updateUser, logout } = authSlice.actions;
export default authSlice.reducer;
