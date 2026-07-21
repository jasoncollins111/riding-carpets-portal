import Link from 'next/link';

interface RankedSong {
  id: number;
  song: string;
  count: number;
  percent?: number;
}

interface RankedListProps {
  items: RankedSong[];
  countLabel?: string;
  showPercent?: boolean;
}

export default function RankedList({
  items,
  countLabel = 'times',
  showPercent = true,
}: RankedListProps) {
  if (!items.length) {
    return <p className="text-gray-500 text-sm">No data available.</p>;
  }

  return (
    <ol className="space-y-2">
      {items.map((item, index) => (
        <li key={item.id} className="flex items-baseline gap-3">
          <span className={`text-sm w-5 text-right shrink-0 ${index === 0 ? 'text-rc-orange font-medium' : 'text-gray-400'}`}>
            {index + 1}.
          </span>
          <div className="flex-1 min-w-0">
            <Link
              href={`/songs/${item.id}`}
              className="link-rc break-words"
            >
              {item.song}
            </Link>
          </div>
          <span className="text-sm text-gray-600 shrink-0 whitespace-nowrap">
            {item.count} {item.count === 1 ? countLabel.replace(/s$/, '') : countLabel}
            {showPercent && item.percent !== undefined && (
              <span className="text-gray-400 ml-1">({item.percent}%)</span>
            )}
          </span>
        </li>
      ))}
    </ol>
  );
}
