import GetStreams from '@/components/getstreams'
import StreamComponent from '@/components/streamComponent'

export const revalidate = 300;

export default async function Page() {
  const streams: any = await GetStreams()

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 font-sans">
      {/* Header */}
      <header className="w-full border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 sticky top-0 z-10 backdrop-blur">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-3">
          <h1 className="text-xl font-semibold text-zinc-900 dark:text-white">Hypixel SkyBlock Streams</h1>
          <span className="ml-auto text-sm text-zinc-400 dark:text-zinc-500">
            {streams.length} live now
          </span>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10">
        {streams.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4 text-center">
            <span className="text-5xl">😴</span>
            <p className="text-zinc-500 dark:text-zinc-400 text-lg font-medium">No streams live right now</p>
            <p className="text-zinc-400 dark:text-zinc-500 text-sm">Check back later</p>
          </div>
        ) : (
          <div className="flex flex-wrap w-full">
            {streams.map((stream: any) => (
              <StreamComponent
                key={stream.id}
                title={stream.title}
                thumbnail={stream.thumbnail_url}
                username={stream.user_name}
                viewer_count={stream.viewer_count}
              />
            ))}
          </div>
        )}
      </main>

      <footer className="w-full border-t border-zinc-200 dark:border-zinc-800 mt-10">
        <div className="max-w-7xl mx-auto px-6 py-4 text-center text-xs text-zinc-400 dark:text-zinc-600">
          Refreshes every 5 minutes · Powered by Twitch API
        </div>
      </footer>
    </div>
  )
}