import { useEffect, useState } from "preact/hooks";

interface SplitPreviewProps {
  blobs: Blob[];
}

export function SplitPreview({ blobs }: SplitPreviewProps) {
  const [urls, setUrls] = useState<string[]>([]);

  useEffect(() => {
    // Create Object URLs
    const newUrls = blobs.map((blob) => URL.createObjectURL(blob));
    setUrls(newUrls);

    // Cleanup
    return () => {
      newUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [blobs]);

  if (blobs.length === 0) return null;

  const handleDownloadAll = () => {
    urls.forEach((url, index) => {
      const a = document.createElement("a");
      a.href = url;
      a.download = `split_image_${index + 1}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    });
  };

  return (
    <div class="mt-6">
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-lg font-medium leading-6 text-gray-900">
          Result Preview
        </h3>
        <button
          onClick={handleDownloadAll}
          class="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
        >
          Download All
        </button>
      </div>

      <div class="grid grid-cols-2 gap-4">
        {urls.map((url, idx) => (
          <div
            key={idx}
            class="relative group border rounded-lg overflow-hidden bg-gray-100"
          >
            <img
              src={url}
              alt={`Split ${idx + 1}`}
              class="w-full h-auto object-contain"
            />
            <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity flex items-center justify-center opacity-0 group-hover:opacity-100">
              <span class="text-white font-bold text-lg">#{idx + 1}</span>
            </div>
            <div class="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 text-center">
              {blobs[idx].type} - {Math.round(blobs[idx].size / 1024)} KB
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
