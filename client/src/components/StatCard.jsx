export default function StatCard({ title, value }) {
  return (
    <div className="bg-white rounded-lg p-5 shadow-sm border">
      <div className="text-sm text-gray-500">{title}</div>
      <div className="text-3xl font-semibold text-gray-800 mt-1">
        {value}
      </div>
    </div>
  );
}
