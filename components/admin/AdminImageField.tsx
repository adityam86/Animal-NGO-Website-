"use client";

import { useState } from "react";
import ImageUploader from "@/components/shared/ImageUploader";

export default function AdminImageField({
  inputName = "image",
  defaultUrl = "/images/dog_bruno.jpg",
  label = "Photo Upload",
}: {
  inputName?: string;
  defaultUrl?: string;
  label?: string;
}) {
  const [url, setUrl] = useState(defaultUrl);

  return (
    <div>
      <input type="hidden" name={inputName} value={url} />
      <ImageUploader
        uploadEndpoint="/api/upload"
        value={url}
        onChange={setUrl}
        label={label}
        helperText="Sanitized and stored in public sanctuary asset storage (JPG/PNG/WebP)"
      />
    </div>
  );
}
