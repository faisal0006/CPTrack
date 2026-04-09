export const getRatingColor = (rating) => {
    if (!rating || rating === 0) return 'text-slate-400 font-semibold';
    if (rating < 1200) return 'text-slate-400 font-semibold'; // Gray
    if (rating >= 1200 && rating < 1400) return 'text-green-500 font-bold'; // Green
    if (rating >= 1400 && rating < 1600) return 'text-cyan-400 font-bold'; // Cyan
    if (rating >= 1600 && rating < 1900) return 'text-blue-500 font-bold'; // Blue
    if (rating >= 1900 && rating < 2100) return 'text-purple-500 font-bold'; // Purple
    if (rating >= 2100 && rating < 2400) return 'text-orange-500 font-bold'; // Orange
    return 'text-red-600 font-bold'; // Red (2400+)
};

export const getRatingBadgeClass = (rating) => {
    if (!rating || rating === 0) return 'bg-slate-700 text-slate-300';
    if (rating < 1200) return 'bg-slate-700 text-slate-300';
    if (rating >= 1200 && rating < 1400) return 'bg-green-500/20 text-green-400';
    if (rating >= 1400 && rating < 1600) return 'bg-cyan-500/20 text-cyan-400';
    if (rating >= 1600 && rating < 1900) return 'bg-blue-500/20 text-blue-400';
    if (rating >= 1900 && rating < 2100) return 'bg-purple-500/20 text-purple-400';
    if (rating >= 2100 && rating < 2400) return 'bg-orange-500/20 text-orange-400';
    return 'bg-red-500/20 text-red-400';
};
