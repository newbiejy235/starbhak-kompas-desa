"use client";

import { uploadImageAction } from "@/actions/upload.action";

export default function UploadForm() {
  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    const result = await uploadImageAction(formData);

    console.log("Public ID:", result);
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="file"
        name="image"
        accept="image/*"
      />

      <button type="submit">
        Upload
      </button>
    </form>
  );
}