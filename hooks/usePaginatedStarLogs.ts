import { useState, useEffect } from 'react';
import { StarLog } from '@/types';

type GetStarLogsPaginatedFunction = (
  userId: string,
  page: number,
  pageSize: number
) => Promise<{ data: StarLog[]; total: number }>;

export function usePaginatedStarLogs(
  selectedUserId: string,
  currentPage: number,
  itemsPerPage: number,
  getStarLogsPaginated: GetStarLogsPaginatedFunction
) {
  const [paginatedLogs, setPaginatedLogs] = useState<StarLog[]>([]);
  const [totalLogs, setTotalLogs] = useState(0);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);

  useEffect(() => {
    const fetchLogs = async () => {
      setIsLoadingLogs(true);
      try {
        const result = await getStarLogsPaginated(selectedUserId, currentPage, itemsPerPage);
        setPaginatedLogs(result.data);
        setTotalLogs(result.total);
      } catch (error) {
        console.error('获取星星日志失败:', error);
      } finally {
        setIsLoadingLogs(false);
      }
    };

    if (selectedUserId) {
      fetchLogs();
    }
  }, [selectedUserId, currentPage, itemsPerPage, getStarLogsPaginated]);

  const totalPages = Math.ceil(totalLogs / itemsPerPage);

  return {
    paginatedLogs,
    totalLogs,
    isLoadingLogs,
    totalPages,
    setCurrentPage: (page: number) => {} // placeholder, actual page control should be in component
  };
}
