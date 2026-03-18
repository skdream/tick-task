'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/contexts/AppContext';
import LoginPage from '@/components/LoginPage';

export default function Home() {
  const router = useRouter();
  const { currentUser } = useApp();

  useEffect(() => {
    if (currentUser) {
      router.push('/tasks');
    }
  }, [currentUser, router]);

  if (currentUser) {
    return null;
  }

  return (
    <main>
      <LoginPage />
    </main>
  );
}
