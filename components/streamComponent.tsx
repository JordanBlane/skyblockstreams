export default function StreamComponent(props: any) {
  return (
    <div className="flex w-1/3 p-3 flex-col group">
      <div className="relative overflow-hidden rounded-xl">
        <img
          src={props.thumbnail}
          className="w-full rounded-xl transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl" />
        <a
          href={`https://twitch.tv/${props.username}`}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
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
        <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate mt-0.5">
          {props.title}
        </p>
        {props.viewer_count && (
          <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">
            👁 {props.viewer_count.toLocaleString()} viewers
          </p>
        )}
      </div>
    </div>
  )
}