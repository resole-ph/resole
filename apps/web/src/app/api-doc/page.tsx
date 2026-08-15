import { getApiDocs } from "@/lib/swagger";
import ReactSwagger from "./react-swagger";

export default async function IndexPage() {
  const spec = await getApiDocs();
  return (
    <main className="container mx-auto py-10">
      <ReactSwagger spec={spec} />
    </main>
  );
}
