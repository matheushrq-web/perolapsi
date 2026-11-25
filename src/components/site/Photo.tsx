import Image from "next/image";
import type { ImageRef } from "@/content/types";

interface Props {
  image: ImageRef;
  sizes: string;
  className?: string;
  preload?: boolean;
  reveal?: boolean;
}

/**
 * Fotografia com enquadramento editável (ponto focal + zoom).
 * Sem foto definida, mostra uma moldura tonal com o motivo da pérola, nunca um rosto gerado.
 */
export function Photo({ image, sizes, className = "", preload = false, reveal = true }: Props) {
  const style = {
    objectPosition: `${image.focalX}% ${image.focalY}%`,
    transform: image.zoom > 1 ? `scale(${image.zoom})` : undefined,
    transformOrigin: `${image.focalX}% ${image.focalY}%`,
  };
  return (
    <div className={`photo ${className}`} data-reveal={reveal ? "image" : undefined}>
      {image.url ? (
        <div className="photo__zoom">
          <Image
            src={image.url}
            alt={image.alt}
            fill
            sizes={sizes}
            preload={preload}
            loading={preload ? "eager" : "lazy"}
            style={style}
            unoptimized={image.url.startsWith("/media/")}
          />
        </div>
      ) : (
        <div className="photo__empty" role="img" aria-label={image.alt || "Espaço reservado para fotografia"}>
          <svg viewBox="0 0 200 200" aria-hidden="true">
            <circle cx="100" cy="100" r="46" fill="url(#pearl-empty)" />
            <circle cx="100" cy="100" r="74" fill="none" stroke="currentColor" strokeWidth=".6" />
            <defs>
              <radialGradient id="pearl-empty" cx="38%" cy="34%" r="70%">
                <stop offset="0" stopColor="#fff" stopOpacity=".95" />
                <stop offset=".45" stopColor="var(--c-perola)" />
                <stop offset="1" stopColor="var(--c-areia)" />
              </radialGradient>
            </defs>
          </svg>
        </div>
      )}
    </div>
  );
}
