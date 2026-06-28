import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { schemaTypes } from "./src/sanity/schemaTypes";

export default defineConfig({
  name: "infrai-cms",
  title: "InfrAI Content",
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "",
  dataset:   process.env.NEXT_PUBLIC_SANITY_DATASET    || "production",
  basePath:  "/studio",
  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title("Content")
          .items([
            S.listItem()
              .title("Landing Page")
              .id("landingPage")
              .child(
                S.document()
                  .schemaType("landingPage")
                  .documentId("landingPage")
              ),
          ]),
    }),
  ],
  schema: { types: schemaTypes },
});
