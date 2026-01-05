import React from "react";

const ConfirmActionModal = ({ open, title, message, onConfirm, onCancel, confirmLabel = "Confirm", cancelLabel = "Cancel" }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow w-96">
        <h4 className="font-bold mb-2">{title}</h4>
        <div className="mb-4 text-gray-700">{message}</div>
        <div className="flex justify-end gap-2">
          <button className="px-4 py-2 bg-gray-200 rounded" onClick={onCancel}>{cancelLabel}</button>
          <button className="px-4 py-2 bg-red-600 text-white rounded" onClick={onConfirm}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmActionModal;
