import { SITE } from "@/config/site";

export default function Home() {
  return (
    <div className="container-site py-10">
      <h1 className="text-3xl font-bold">{SITE.name}</h1>
    </div>
  );
}
