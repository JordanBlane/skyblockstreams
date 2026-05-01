import StreamComponent from '@/components/streamComponent'
import AutoRefresh from '@/components/autorefresh';
import GetStreams from '@/lib/streams';
import Image from 'next/image';

export const revalidate = 300;

export default async function Page() {
  const streams = await GetStreams();
  return (
    <div className="min-h-screen font-sans relative">
      <AutoRefresh />
      <div className="fixed inset-0 -z-10">
        <Image
          src="/bg2.png"
          alt="Background"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/50" />
      </div>
      <header className="w-full sticky top-0 z-10">
        <div className="absolute inset-0 bg-white/10 dark:bg-zinc-900/40 backdrop-blur-md border-b border-white/20 dark:border-zinc-800" />
        <div className="relative max-w-7xl mx-auto px-6 py-5 flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-purple-600 shadow-lg shadow-purple-500/30">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                <path d="M11.64 5.93h1.43v4.28h-1.43m3.93-4.28H17v4.28h-1.43M7 2L3.43 5.57v12.86h4.28V22l3.58-3.57h2.85L20.57 12V2m-1.43 9.29l-2.85 2.85h-2.86l-2.5 2.5v-2.5H7.71V3.43h11.43z"/>
              </svg>
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-zinc-900" />
            </div>
            <div>
              <h1 className="text-base font-semibold text-white leading-tight">
                Hypixel SkyBlock
              </h1>
              <p className="text-xs text-zinc-300 leading-tight">Live on Twitch</p>
            </div>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <span className="flex items-center gap-1.5 text-xs font-medium text-red-400 bg-red-500/20 px-2.5 py-1 rounded-full border border-red-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              {streams.length} live
            </span>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-6 py-10">
        {streams.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4 text-center">
            <span className="text-5xl">😴</span>
            <p className="text-white text-lg font-medium">No streams live right now</p>
            <p className="text-zinc-300 text-sm">Check back later</p>
          </div>
        ) : (
          <div className="flex flex-wrap w-full">
            {streams.map((stream) => (
              <StreamComponent
                key={stream.user_id}
                title={stream.title}
                thumbnail={stream.thumbnail_url}
                username={stream.user_name}
                viewer_count={stream.viewer_count}
              />
            ))}
          </div>
        )}
      </main>
      <footer className="w-full border-t border-white/20 mt-10">
        <div className="max-w-7xl mx-auto px-6 py-4 text-center text-xs text-zinc-400">
          Refreshes every 5 minutes
        </div>
      </footer>
    </div>
  );
}