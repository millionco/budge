import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default async function Icon() {
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
          backgroundColor: "#ffffff",
          borderRadius: 6,
        }}
      >
        <div
          style={{
            fontFamily: "Ivar Hand",
            fontSize: 24,
            color: "#3C3C3C",
            lineHeight: 1,
            marginTop: 2,
          }}
        >
          b
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
