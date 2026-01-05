export default function Loader({ text = 'Loading...' }) {
  return (
    <div className="flex items-center justify-center py-10">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#026c8a] border-t-transparent" />
        <p className="text-sm text-gray-500">{text}</p>
      </div>
    </div>
  );
}
