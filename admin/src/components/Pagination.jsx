const Pagination = ({ currentPage, totalPages, totalItems, limit, onPageChange }) => {
  const start = (currentPage - 1) * limit + 1;
  const end = Math.min(currentPage * limit, totalItems);

  const getPages = () => {
    const pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('...');
      const s = Math.max(2, currentPage - 1);
      const e = Math.min(totalPages - 1, currentPage + 1);
      for (let i = s; i <= e; i++) pages.push(i);
      if (currentPage < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className="d-flex justify-content-center align-items-center mt-3 flex-wrap gap-2">
      <span className="text-muted" style={{ fontSize: '13px' }}>
        Showing {start}–{end} of {totalItems} appointments
      </span>

      <ul className="pagination pagination-sm mb-0">
        <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
          <button className="page-link" onClick={() => onPageChange(currentPage - 1)}>‹</button>
        </li>

        {getPages().map((page, i) =>
          page === '...' ? (
            <li key={i} className="page-item disabled"><span className="page-link">…</span></li>
          ) : (
            <li key={i} className={`page-item ${page === currentPage ? 'active' : ''}`}>
              <button className="page-link" onClick={() => onPageChange(page)}>{page}</button>
            </li>
          )
        )}

        <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
          <button className="page-link" onClick={() => onPageChange(currentPage + 1)}>›</button>
        </li>
      </ul>
    </div>
  );
};

export default Pagination;