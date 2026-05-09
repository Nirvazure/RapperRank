import { redirect } from "next/navigation";
import { rappers } from "@/data/rappers";
import { getRandomRapper } from "@/features/rappers/rapper.utils";

export const dynamic = "force-dynamic";

export default function Home() {
  const rapper = getRandomRapper(rappers);

  redirect(`/rank/${rapper?.id ?? "kendrick-lamar"}`);
}
