'use client';
import { useEffect, useState } from 'react';
import Image from './SafeImage';
export default function FilePreview({ file, ...props }) {
  const [url, setUrl] = useState(null);
  useEffect(() => {
    const preview = URL.createObjectURL(file);
    setUrl(preview);
    return () => URL.revokeObjectURL(preview);
  }, [file]);
  return url ? <Image {...props} src={url} alt={props.alt || 'Selected image'} /> : null;
}
