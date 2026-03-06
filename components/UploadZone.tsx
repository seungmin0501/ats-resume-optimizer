"use client";

import { useRef, useState, useCallback } from "react";
import { useTranslations } from "next-intl";

type UploadZoneProps = {
  onFileLoaded: (file: File) => void;
  fileName?: string;
};

export default function UploadZone({ onFileLoaded, fileName }: UploadZoneProps) {
  const t = useTranslations("analyze");
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const MAX_SIZE = 5 * 1024 * 1024; // 5MB

  const validateAndLoad = useCallback(
    (file: File) => {
      setError(null);

      // MIME type + 확장자 이중 검증
      if (
        file.type !== "application/pdf" &&
        !file.name.toLowerCase().endsWith(".pdf")
      ) {
        setError(t("resume_type_error"));
        return;
      }

      if (file.size > MAX_SIZE) {
        setError(t("resume_size_error"));
        return;
      }

      onFileLoaded(file);
    },
    [onFileLoaded, t]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) validateAndLoad(file);
    },
    [validateAndLoad]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) validateAndLoad(file);
  };

  return (
    <div>
      <div
        onClick={() => inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        className={`
          border-2 border-dashed rounded-lg px-4 py-8 text-center cursor-pointer transition-colors
          ${isDragging
            ? "border-blue-400 bg-blue-50"
            : fileName
            ? "border-green-300 bg-green-50"
            : "border-gray-300 hover:border-gray-400 bg-white"
          }
        `}
      >
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf,.pdf"
          onChange={handleChange}
          className="hidden"
        />

        {fileName ? (
          <div className="flex items-center justify-center gap-2 text-green-700">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <div>
              <p className="text-sm font-medium">{fileName}</p>
              <p className="text-xs text-green-600">{t("resume_loaded")}</p>
            </div>
          </div>
        ) : (
          <div className="text-gray-500">
            <svg
              className="w-10 h-10 mx-auto mb-3 text-gray-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <p className="text-sm">{t("resume_upload_label")}</p>
            <p className="text-xs text-gray-400 mt-1">PDF only · Max 5MB</p>
          </div>
        )}
      </div>

      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}
