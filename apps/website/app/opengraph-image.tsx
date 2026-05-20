import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OGImage() {
  const fontData = await readFile(
    join(process.cwd(), "public/fonts/IvarHandTRIAL-Regular.otf"),
  );

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#fbfaf9",
        }}
      >
        <div
          style={{
            fontFamily: "Ivar Hand",
            fontSize: 120,
            color: "#3C3C3C",
          }}
        >
          budge
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: "Ivar Hand",
          data: fontData,
          style: "normal",
          weight: 400,
        },
      ],
    },
  );
}
