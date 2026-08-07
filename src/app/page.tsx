'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const user_role = localStorage.getItem('user_role');
    if (user_role === 'admin') {
      router.push('/admin/dashboard');
    } else if (user_role === 'petani') {
      router.push('/petani/dashboard');
    } else if (user_role === 'pembeli') {
      router.push('/user/home');
    } else {
      router.push('/kompas-desa');
    }
  }, [router]);

  return null;
}