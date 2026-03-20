import { useEffect, useRef, useCallback } from 'react';

type RefreshDataFunction = (dateFilter?: Date) => Promise<void>;

export function useRefreshData(
  refreshData: RefreshDataFunction | undefined,
  currentUser: unknown,
  selectedDate: Date
) {
  const refreshDataRef = useRef(refreshData);
  refreshDataRef.current = refreshData;

  const selectedDateRef = useRef(selectedDate);
  selectedDateRef.current = selectedDate;

  const refresh = useCallback(() => {
    if (refreshDataRef.current) {
      refreshDataRef.current(selectedDateRef.current);
    }
  }, []);

  useEffect(() => {
    if (currentUser && refreshDataRef.current) {
      refreshDataRef.current(selectedDateRef.current);
    }
  }, [currentUser]);

  useEffect(() => {
    if (refreshDataRef.current) {
      refreshDataRef.current(selectedDateRef.current);
    }
  }, [selectedDate]);

  return { refresh };
}

interface Task {
  id: string;
  status: string;
  assignedTo?: string;
  familyId: string;
}

export function useCelebrationEffect(
  filteredTasks: Task[],
  isParent: boolean,
  justCompletedTask: boolean,
  onShowCelebration: () => void,
  onResetCompleted: () => void
) {
  useEffect(() => {
    const pendingTasks = filteredTasks.filter(task => task.status === 'pending');

    if (pendingTasks.length === 0 && filteredTasks.length > 0 && !isParent && justCompletedTask) {
      const timer = setTimeout(() => {
        onShowCelebration();
        onResetCompleted();
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [filteredTasks, isParent, justCompletedTask, onShowCelebration, onResetCompleted]);
}
