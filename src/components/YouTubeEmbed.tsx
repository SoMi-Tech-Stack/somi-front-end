import { isYouTubeChannelTrusted } from '../utils/trusted-sources';

interface Props {
  videoId: string;
  title: string;
  channelId?: string;
}

export function YouTubeEmbed({ videoId, title, channelId }: Props) {
  const isTrusted = channelId ? isYouTubeChannelTrusted(channelId) : false;

  return (
    <div className="space-y-4">
      <div className="aspect-video w-full rounded-lg overflow-hidden shadow-lg">
        <iframe
          width="100%"
          height="100%"
          src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`}
          title={`${title} - YouTube video player`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full"
        />
      </div>
      
      {/* {!isTrusted && (
        <div className="flex items-center gap-2 text-amber-600 text-sm bg-amber-50 px-4 py-2 rounded-lg">
          <AlertTriangle className="w-4 h-4" />
          <span>This video is from an unverified source. Consider using recordings from trusted classical music channels.</span>
        </div>
      )} */}
    </div>
  );
}