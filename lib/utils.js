export function formatNumber(num) {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num?.toString() || '0';
}

export function formatDate(dateString) {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateTime(dateString) {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function calculateWinRate(wins, losses, ties) {
  const total = wins + losses + ties;
  if (total === 0) return 0;
  return ((wins / total) * 100).toFixed(1);
}

export function getResultColor(result) {
  switch (result) {
    case 'W':
    case 'win':
      return 'text-green-400 bg-green-500/20';
    case 'L':
    case 'loss':
      return 'text-red-400 bg-red-500/20';
    case 'D':
    case 'draw':
      return 'text-yellow-400 bg-yellow-500/20';
    default:
      return 'text-slate-400 bg-slate-500/20';
  }
}

export function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}
