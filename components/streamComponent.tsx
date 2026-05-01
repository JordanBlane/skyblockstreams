'use client';

import { useRef } from 'react';

export default function StreamComponent(props: any) {
  const cardRef = useRef<HTMLDivElement>(null);

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const card = cardRef.current;
    if (!card) return;
    const { left, top, width, height } = card.getBoundingClientRect();
    const px = (e.clientX - left) / width - 0.5;
    const py = (e.clientY - top) / height - 0.5;
    card.style.transform = `perspective(600px) rotateY(${-px * 16}deg) rotateX(${py * 16}deg) scale(1.05)`;
    card.style.boxShadow = `${-px * 16}px ${py * 16}px 24px rgba(0,0,0,0.2)`;
  }

  function handleMouseLeave() {
    const card = cardRef.current;
    if (!card) return;
    card.style.transform = 'perspective(600px) rotateY(0deg) rotateX(0deg) scale(1)';
    card.style.boxShadow = 'none';
  }

  return (
    <div className="flex w-1/3 p-3 flex-col">
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ transition: 'transform 0.15s ease-out, box-shadow 0.15s ease-out', willChange: 'transform' }}
        className="relative overflow-hidden rounded-xl cursor-pointer"
      >
        <img
          src={props.thumbnail}
          className="w-full rounded-xl"
          draggable={false}
        />
        <div className="absolute inset-0 bg-black/20 opacity-0 hover:opacity-100 transition-opacity duration-300 rounded-xl" />
        <a
          href={`https://twitch.tv/${props.username}`}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300"
        >
          <span className="bg-purple-600 hover:bg-purple-500 text-white text-sm font-semibold px-4 py-2 rounded-full shadow-lg">
            ▶ Watch Live
          </span>
        </a>
        <span className="absolute top-2 left-2 bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
          LIVE
        </span>
      </div>
      <div className="mt-2 px-1">
        <p className="font-semibold text-sm text-zinc-900 dark:text-white truncate">
          {props.username}
        </p>
        <p className="text-xs text-zinc-500 dark:text-zinc-200 truncate mt-0.5">
          {props.title}
        </p>
        {props.viewer_count != null && (
          <p className="text-xs text-zinc-400 dark:text-zinc-400 mt-1">
            👁 {props.viewer_count.toLocaleString()} viewers
          </p>
        )}
      </div>
    </div>
  );
}