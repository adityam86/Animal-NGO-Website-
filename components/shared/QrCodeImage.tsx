"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";

type QrCodeImageProps = {
  value: string;
  size?: number;
  label?: string;
};

export default function QrCodeImage({ value, size = 136, label = "Verification QR Code" }: QrCodeImageProps) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    QRCode.toDataURL(value, {
      width: size * 2,
      margin: 1,
      color: {
        dark: "#183627",
        light: "#FFFFFF",
      },
      errorCorrectionLevel: "M",
    })
      .then((url) => {
        if (mounted) setDataUrl(url);
      })
      .catch(() => {
        if (mounted) setDataUrl(null);
      });
    return () => {
      mounted = false;
    };
  }, [value, size]);

  if (!dataUrl) {
    return (
      <div
        style={{
          width: size,
          height: size,
          borderRadius: "var(--radius-sm)",
          background: "var(--cream-100)",
          border: "1px solid var(--cream-200)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "0.7rem",
          color: "var(--stone-500)",
        }}
      >
        Generating QR…
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={dataUrl}
      alt={label}
      width={size}
      height={size}
      style={{
        display: "block",
        width: size,
        height: size,
        borderRadius: "var(--radius-sm)",
        border: "1px solid var(--cream-200)",
        background: "#FFFFFF",
      }}
    />
  );
}
