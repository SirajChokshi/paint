import styled from "@emotion/styled";
import { ChangeEvent, useMemo, useRef, useState } from "react";

const Page = styled.div`
  width: 100vw;
  height: 100vh;
  display: grid;
  grid-template-columns: minmax(300px, 380px) minmax(512px, 1fr);
  overflow: auto;
  background: #1d2433;
  color: #f4f7fb;
  font-family:
    ui-sans-serif,
    system-ui,
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    sans-serif;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

const Panel = styled.section`
  padding: 24px;
  border-right: 1px solid rgba(255, 255, 255, 0.16);
  background: rgba(0, 0, 0, 0.2);

  @media (max-width: 900px) {
    border-right: 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.16);
  }
`;

const Title = styled.h1`
  margin: 0 0 8px;
  font-size: 24px;
`;

const Copy = styled.p`
  color: #c8d1df;
  line-height: 1.5;
`;

const Group = styled.div`
  display: grid;
  gap: 10px;
  margin-top: 24px;
`;

const Label = styled.label`
  display: grid;
  gap: 6px;
  font-size: 13px;
  font-weight: 700;
  color: #dce6f5;
`;

const TextArea = styled.textarea`
  min-height: 90px;
  resize: vertical;
  padding: 10px;
  border: 1px solid rgba(255, 255, 255, 0.24);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.08);
  color: #ffffff;
  font: inherit;
`;

const ButtonRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const Button = styled.button`
  border: 0;
  border-radius: 8px;
  padding: 9px 12px;
  background: #7db1ff;
  color: #06101f;
  font-weight: 800;
  cursor: pointer;

  &:disabled {
    cursor: not-allowed;
    opacity: 0.55;
  }
`;

const SecondaryButton = styled(Button)`
  background: rgba(255, 255, 255, 0.14);
  color: #f4f7fb;
`;

const Preview = styled.img`
  max-width: 100%;
  max-height: 160px;
  object-fit: contain;
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 8px;
  background: #ffffff;
  image-rendering: pixelated;
`;

const Status = styled.output`
  min-height: 20px;
  color: #b8f7c8;
`;

const FrameWrap = styled.section`
  position: relative;
  min-width: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 10px;
  padding: 24px;
  overflow: auto;
  background: #243249;
`;

const FrameLabel = styled.div`
  color: #c8d1df;
  font-size: 13px;
`;

const TestFrame = styled.iframe`
  width: 512px;
  max-width: 100%;
  aspect-ratio: 512 / 342;
  height: auto;
  border: 0;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.32);
  background: #4a7dc6;
`;

function makeSampleDataUrl(kind: "checker" | "stripes" | "portrait") {
  const canvas = document.createElement("canvas");
  canvas.width = kind === "portrait" ? 32 : 96;
  canvas.height = kind === "portrait" ? 96 : 48;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return "";
  }

  ctx.imageSmoothingEnabled = false;
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  if (kind === "checker") {
    for (let y = 0; y < canvas.height; y += 8) {
      for (let x = 0; x < canvas.width; x += 8) {
        ctx.fillStyle = (x + y) / 8 % 2 === 0 ? "#111111" : "#ff4a7a";
        ctx.fillRect(x, y, 8, 8);
      }
    }
  } else if (kind === "stripes") {
    const colors = ["#0b61ff", "#ffcc00", "#f04b38", "#1a1a1a"];
    colors.forEach((color, index) => {
      ctx.fillStyle = color;
      ctx.fillRect(index * 24, 0, 24, canvas.height);
    });
  } else {
    ctx.fillStyle = "#213a8f";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#ffdf70";
    ctx.fillRect(8, 10, 16, 20);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(5, 36, 22, 48);
    ctx.fillStyle = "#e23b3b";
    ctx.fillRect(10, 44, 12, 22);
  }

  return canvas.toDataURL("image/png");
}

export default function ImportTestPage() {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [imageUrl, setImageUrl] = useState("");
  const [status, setStatus] = useState("Choose a sample, upload a file, or paste a data URL.");
  const samples = useMemo(
    () => ({
      checker: makeSampleDataUrl("checker"),
      stripes: makeSampleDataUrl("stripes"),
      portrait: makeSampleDataUrl("portrait"),
    }),
    [],
  );

  function sendImport(url = imageUrl) {
    if (!url) {
      setStatus("No image URL selected.");
      return;
    }

    iframeRef.current?.contentWindow?.postMessage(
      { type: "import", payload: { url } },
      window.location.origin,
    );
    setImageUrl(url);
    setStatus("Sent import message to the embedded paint app.");
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        sendImport(reader.result);
      }
    };
    reader.onerror = () => setStatus("Could not read selected file.");
    reader.readAsDataURL(file);
  }

  return (
    <Page>
      <Panel>
        <Title>PixelCanvas Import Test</Title>
        <Copy>
          Dev-only harness for testing the frame import message and{" "}
          <code>PixelCanvas.import()</code>. Remote image URLs need CORS because
          import reads pixels back from the canvas.
        </Copy>

        <Group>
          <ButtonRow>
            <Button onClick={() => sendImport(samples.checker)}>Checker</Button>
            <Button onClick={() => sendImport(samples.stripes)}>Stripes</Button>
            <Button onClick={() => sendImport(samples.portrait)}>Portrait</Button>
          </ButtonRow>
          {imageUrl ? <Preview src={imageUrl} alt="Import preview" /> : null}
        </Group>

        <Group>
          <Label>
            Upload image
            <input accept="image/*" type="file" onChange={handleFileChange} />
          </Label>
        </Group>

        <Group>
          <Label>
            Image URL or data URL
            <TextArea
              value={imageUrl}
              onChange={(event) => setImageUrl(event.currentTarget.value)}
              placeholder="data:image/png;base64,..."
            />
          </Label>
          <ButtonRow>
            <Button onClick={() => sendImport()} disabled={!imageUrl}>
              Import
            </Button>
            <SecondaryButton onClick={() => setReloadKey((key) => key + 1)}>
              Reload Paint App
            </SecondaryButton>
          </ButtonRow>
          <Status>{status}</Status>
        </Group>
      </Panel>

      <FrameWrap>
        <FrameLabel>Embedded paint app, fixed to the app&apos;s logical aspect ratio</FrameLabel>
        <TestFrame
          key={reloadKey}
          ref={iframeRef}
          title="Paint app import target"
          src="/"
        />
      </FrameWrap>
    </Page>
  );
}
