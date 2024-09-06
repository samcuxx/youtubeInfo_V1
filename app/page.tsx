import { Component } from "@/components/component/component";
import { YoutubeInfo } from "@/components/component/youtube-info";

export default function Home() {
  return (
    <>
      <Component />
      <div className="flex flex-col items-center justify-center h-screen">
        <YoutubeInfo />
      </div>
    </>
  );
}
