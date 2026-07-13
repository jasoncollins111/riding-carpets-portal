interface StatCardProps {
  label: string;
  value: string | number;
  detail?: string;
}

export default function StatCard({ label, value, detail }: StatCardProps) {
  return (
    <div className="p-4 border border-gray-200 rounded-lg shadow-sm text-center">
      <p className="text-2xl sm:text-3xl font-bold text-gray-900">
        {typeof value === 'number' ? value.toLocaleString('en-US') : value}
      </p>
      <p className="text-sm text-gray-600 mt-1">{label}</p>
      {detail && <p className="text-xs text-gray-400 mt-0.5">{detail}</p>}
    </div>
  );
}
