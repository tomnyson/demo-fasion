import { SITE } from "@/config/site";

export default function Home() {
  return (
    <main className="container-site py-10">
      <h1 className="text-3xl font-bold">{SITE.name}</h1>
    </main>
  );
}
