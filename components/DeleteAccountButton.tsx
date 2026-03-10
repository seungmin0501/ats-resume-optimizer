"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DeleteAccountButton() {
  const [showModal, setShowModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleDelete() {
    setIsDeleting(true);
    setError(null);
    try {
      const res = await fetch("/api/account/delete", { method: "DELETE" });
      if (res.ok) {
        router.push("/");
      } else {
        const data = await res.json();
        setError(data.error ?? "Something went wrong. Please try again.");
        setIsDeleting(false);
      }
    } catch {
      setError("Network error. Please try again.");
      setIsDeleting(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="text-sm text-red-600 hover:text-red-700 font-medium underline underline-offset-2"
      >
        Delete Account
      </button>

      {showModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false); }}
        >
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                </svg>
              </div>
              <h2 className="text-lg font-bold text-gray-900">Delete Your Account</h2>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-5">
              <p className="text-sm font-semibold text-red-800 mb-1">⚠ This action is permanent and cannot be undone.</p>
              <ul className="text-sm text-red-700 space-y-1 list-disc list-inside">
                <li>All your analysis history will be deleted</li>
                <li>Your account and login access will be removed</li>
                <li>Unused credits cannot be recovered</li>
              </ul>
            </div>

            {error && (
              <p className="text-sm text-red-600 mb-4 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => { setShowModal(false); setError(null); }}
                disabled={isDeleting}
                className="flex-1 border border-gray-300 text-gray-700 font-semibold rounded-xl py-2.5 text-sm hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl py-2.5 text-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isDeleting ? "Deleting..." : "Delete Permanently"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
