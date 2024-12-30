interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  return (
    <div className="flex justify-center gap-2 mt-4">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-3 py-1 bg-white/10 hover:bg-white/20 disabled:bg-white/5 disabled:text-white/50 rounded-md text-sm transition-colors"
      >
        Previous
      </button>
      
      <span className="px-3 py-1 text-white/70 text-sm">
        Page {currentPage} of {totalPages}
      </span>
      
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-3 py-1 bg-white/10 hover:bg-white/20 disabled:bg-white/5 disabled:text-white/50 rounded-md text-sm transition-colors"
      >
        Next
      </button>
    </div>
  );
} 