'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const user_role = localStorage.getItem('user_role');
    if (user_role === 'admin') {
      router.push('/admin/default');
    } else if (user_role === 'user') {
      router.push('/user/home');
    }else {
      router.push('/kompas-desa');
    }
  }, []);

  return null;
}