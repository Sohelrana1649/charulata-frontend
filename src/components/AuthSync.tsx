'use client';

import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { updateUser } from '@/store/authSlice';
import { useGetProfileQuery } from '@/store/api/authApi';

export default function AuthSync() {
  const dispatch = useAppDispatch();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  const { data: profileRes } = useGetProfileQuery(
    {},
    { skip: !isAuthenticated, refetchOnMountOrArgChange: true }
  );

  useEffect(() => {
    const fetchedUser = profileRes?.data?.user || profileRes?.data || profileRes?.user;
    if (fetchedUser && fetchedUser._id) {
      if (
        user?.role !== fetchedUser.role ||
        user?.name !== fetchedUser.name ||
        user?.profileImage !== fetchedUser.profileImage
      ) {
        dispatch(updateUser(fetchedUser));
      }
    }
  }, [profileRes, user, dispatch]);

  return null;
}
