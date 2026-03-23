import { useState, useEffect, useMemo } from 'react';

export function useChildren(
  users: Array<{ id: string; role: string; familyId: string; name: string; avatar?: string }>,
  currentUser: { id: string; role: string; familyId: string } | null
) {
  const children = useMemo(() => 
    users.filter(user => user.role === 'child' && user.familyId === currentUser?.familyId),
    [users, currentUser?.familyId]
  );

  const [selectedUserId, setSelectedUserId] = useState<string>('');

  useEffect(() => {
    const isParent = currentUser?.role === 'parent';
    if (isParent && children.length > 0 && !selectedUserId) {
      setSelectedUserId(children[0].id);
    } else if (!isParent && currentUser?.id) {
      setSelectedUserId(currentUser.id);
    }
  }, [children, currentUser, selectedUserId]);

  return {
    children,
    selectedUserId,
    setSelectedUserId,
    isParent: currentUser?.role === 'parent'
  };
}
