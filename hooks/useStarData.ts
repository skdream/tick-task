import { useState, useEffect, useCallback } from 'react';

type GetUserTotalStarsFunction = (userId?: string) => Promise<{ data: number }>;

export function useStarData(
  children: Array<{ id: string; name: string }>,
  currentUser: { id: string; role: string } | null,
  selectedUserId: string,
  getUserTotalStars: GetUserTotalStarsFunction
) {
  const [userStars, setUserStars] = useState<Record<string, number>>({});
  const [currentUserStars, setCurrentUserStars] = useState(0);
  const isParent = currentUser?.role === 'parent';

  const fetchCurrentUserStars = useCallback(async () => {
    if (!currentUser) return;

    try {
      if (!isParent) {
        const result = await getUserTotalStars(currentUser.id);
        setCurrentUserStars(result.data);
        setUserStars(prev => ({ ...prev, [currentUser.id]: result.data }));
      } else {
        const starsMap: Record<string, number> = {};
        for (const child of children) {
          try {
            const result = await getUserTotalStars(child.id);
            starsMap[child.id] = result.data;
          } catch (error) {
            console.error(`获取孩子${child.name}的星星总数失败:`, error);
            starsMap[child.id] = 0;
          }
        }
        setUserStars(starsMap);
        if (selectedUserId && starsMap[selectedUserId] !== undefined) {
          setCurrentUserStars(starsMap[selectedUserId]);
        }
      }
    } catch (error) {
      console.error('获取星星总数失败:', error);
      setCurrentUserStars(0);
    }
  }, [currentUser, isParent, children, selectedUserId, getUserTotalStars]);

  useEffect(() => {
    fetchCurrentUserStars();
  }, [fetchCurrentUserStars]);

  useEffect(() => {
    if (isParent && selectedUserId && userStars[selectedUserId] !== undefined) {
      setCurrentUserStars(userStars[selectedUserId]);
    }
  }, [selectedUserId, userStars, isParent]);

  return {
    userStars,
    currentUserStars,
    refetchStars: fetchCurrentUserStars
  };
}
