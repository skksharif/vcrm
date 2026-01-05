export default function ErrorState({ message }) {
  return (
    <div className="p-6 bg-red-50 border border-red-200 text-red-700 rounded">
      {message}
    </div>
  );
}
