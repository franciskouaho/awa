import { router } from 'expo-router';
import { useEffect } from 'react';

export default function IndexScreen() {
  useEffect(() => {
    router.replace('/intro');
  }, []);

  return null;
}
