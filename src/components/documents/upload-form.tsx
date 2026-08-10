"use client";

import { useActionState, useRef } from "react";
import { uploadDocument, type UploadState } from "@/lib/rag/upload-action";

const initialState: UploadState = {};

export function UploadForm() {
  const [state, formAction, isPending] = useActionState(
    uploadDocument,
    initialState,
  );
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form
      ref={formRef}
      action={async (formData) => {
        await formAction(formData);
        formRef.current?.reset();
      }}
      className="flex flex-col gap-3 rounded-lg border border-dashed border-gray-300 p-6"
    >
      <label htmlFor="file" className="text-sm font-medium">
        Upload a PDF
      </label>
      <input
        id="file"
        name="file"
        type="file"
        accept="application/pdf"
        required
        className="text-sm file:mr-3 file:rounded-md file:border-0 file:bg-gray-900 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-white hover:file:bg-gray-700"
      />

      <button
        type="submit"
        disabled={isPending}
        className="self-start rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-700 disabled:opacity-50"
      >
        {isPending ? "Processing..." : "Upload"}
      </button>

      {state.error ? (
        <p className="text-sm text-red-600" role="alert">
          {state.error}
        </p>
      ) : null}
      {state.success ? (
        <p className="text-sm text-green-700" role="status">
          {state.success}
        </p>
      ) : null}
    </form>
  );
}
