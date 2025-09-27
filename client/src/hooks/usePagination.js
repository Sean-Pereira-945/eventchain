import { useMemo, useState } from 'react';

const usePagination = (items = [], initialPage = 1, perPage = 10) => {
  const [page, setPage] = useState(initialPage);

  const totalPages = Math.max(1, Math.ceil(items.length / perPage));

  const paginated = useMemo(() => {
    const start = (page - 1) * perPage;
    return items.slice(start, start + perPage);
  }, [items, page, perPage]);

  const next = () => setPage((current) => Math.min(current + 1, totalPages));
  const prev = () => setPage((current) => Math.max(current - 1, 1));

  return {
    page,
    totalPages,
    items: paginated,
    next,
    prev,
    setPage
  };
};

export default usePagination;
