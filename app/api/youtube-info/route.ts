import { NextResponse } from "next/server";
import { google } from "googleapis";

const youtube = google.youtube({
  version: "v3",
  auth: process.env.YOUTUBE_API_KEY,
});

export async function POST(request: Request) {
  console.log("API route called");

  const body = await request.json();
  console.log("Request body:", body);

  const { videoUrl } = body;

  if (!videoUrl) {
    return NextResponse.json(
      { message: "Video URL is required" },
      { status: 400 }
    );
  }

  try {
    const videoId = extractVideoId(videoUrl);
    console.log("Extracted video ID:", videoId);

    console.log(
      "YouTube API Key:",
      process.env.YOUTUBE_API_KEY ? "Set" : "Not set"
    );

    const response = await youtube.videos.list({
      part: ["snippet", "statistics"],
      id: [videoId],
    });

    console.log(
      "YouTube API response:",
      JSON.stringify(response.data, null, 2)
    );

    const videoInfo = response.data.items?.[0];

    if (!videoInfo) {
      console.log("Video info not found");
      return NextResponse.json({ message: "Video not found" }, { status: 404 });
    }

    const result = {
      title: videoInfo.snippet?.title || "",
      description: videoInfo.snippet?.description || "",
      tags: videoInfo.snippet?.tags || [],
      thumbnails: videoInfo.snippet?.thumbnails || {},
      channelTitle: videoInfo.snippet?.channelTitle || "",
      publishedAt: videoInfo.snippet?.publishedAt || "",
      viewCount: videoInfo.statistics?.viewCount || "0",
      likeCount: videoInfo.statistics?.likeCount || "0",
    };

    console.log("Returning video info:", result);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Detailed error in API route:", error);
    return NextResponse.json(
      {
        message: "Internal Server Error",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

function extractVideoId(url: string): string {
  const regex =
    /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = url.match(regex);
  if (!match) {
    throw new Error("Invalid YouTube URL");
  }
  return match[1];
}
