'use client';
import NextImage from 'next/image';
import { useState } from 'react';

export default function SafeImage({ src, alt = '', onError, unoptimized, ...props }) {
  const [failedSource, setFailedSource] = useState(null);
  const valid = typeof src === 'object' && src?.src || typeof src === 'string' && (/^\/(?!\/)/.test(src) || /^https?:\/\//.test(src) || /^(blob:|data:image\/)/.test(src));
  const imageSrc = valid && failedSource !== src ? src : '/image-placeholder.svg';
  // Admin-authored image URLs may use other hosts. Load those directly.
  const external = typeof imageSrc === 'string' && /^https?:/.test(imageSrc) && !/^https:\/\/(firebasestorage|storage)\.googleapis\.com\//.test(imageSrc);
  return <NextImage {...props} src={imageSrc} alt={alt} unoptimized={unoptimized || external}
    onError={event => { setFailedSource(src); onError?.(event); }} />;
}
