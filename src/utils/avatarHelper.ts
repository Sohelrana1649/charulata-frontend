export const defaultTeamAvatars = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80',
];

/**
 * Extracts the user's uploaded avatar/profile photo URL across all possible field aliases.
 * Handles relative paths, data URLs, absolute URLs, and persistent local storage caching.
 */
export const getUserAvatarUrl = (user: any): string => {
  if (!user) return '';
  const userKey = user._id || user.email || user.id || 'user';
  let localAvatar = '';
  if (typeof window !== 'undefined') {
    try {
      localAvatar = localStorage.getItem(`charulata_avatar_${userKey}`) || '';
    } catch {}
  }

  const img =
    user.profileImage ||
    user.avatar ||
    user.avatarUrl ||
    user.image ||
    user.photo ||
    user.picture ||
    user.profilePicture ||
    localAvatar;

  if (img && typeof img === 'string' && img.trim()) {
    const trimmed = img.trim();
    let finalUrl = trimmed;
    if (!trimmed.startsWith('http') && !trimmed.startsWith('data:')) {
      let baseApiUrl =
        process.env.NEXT_PUBLIC_API_URL || 'https://charulata-database.onrender.com/api/v1';
      if (typeof window !== 'undefined' && baseApiUrl.includes('localhost')) {
        baseApiUrl = baseApiUrl.replace('localhost', window.location.hostname);
      }
      const host = baseApiUrl.replace('/api/v1', '').replace(/\/+$/, '');
      finalUrl = `${host}/${trimmed.replace(/^\/+/, '')}`;
    }

    if (typeof window !== 'undefined' && finalUrl) {
      try {
        localStorage.setItem(`charulata_avatar_${userKey}`, finalUrl);
      } catch {}
    }

    return finalUrl;
  }
  return '';
};

export const saveUserAvatarLocally = (user: any, url: string) => {
  if (!user || typeof window === 'undefined') return;
  const userKey = user._id || user.email || user.id || 'user';
  try {
    if (url) {
      localStorage.setItem(`charulata_avatar_${userKey}`, url);
    } else {
      localStorage.removeItem(`charulata_avatar_${userKey}`);
    }
  } catch {}
};

/**
 * Returns user uploaded avatar or a deterministic realistic human portrait fallback.
 */
export const getFallbackAvatarUrl = (user: any): string => {
  const existing = getUserAvatarUrl(user);
  if (existing) return existing;
  const key = user?._id || user?.email || user?.name || 'user';
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = (hash << 5) - hash + key.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % defaultTeamAvatars.length;
  return defaultTeamAvatars[index];
};
