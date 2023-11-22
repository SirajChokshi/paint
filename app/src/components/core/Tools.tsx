import styled from "@emotion/styled";

const ToolGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr); // change to 2 columns for icons
  grid-template-rows: auto;
  gap: 0.25rem;
  padding: 0.25rem;

  button {
    aspect-ratio: 1;
    border: 2px outset grey;
    background: lightgrey;

    &:active {
      border: 2px inset grey;
      filter: brightness(0.85);
    }
  }
`;

const COLORS = [
  "#ff0000",
  "#ff8200",
  "#fffb00",
  "#00fb00",
  "#008242",
  "#00fbff",
  "#0000ff",
  "#c64121",
  "#846100",
  "#ffc384",
  "#c600c6",
  "#000000",
  "#848284",
  "#c6c3c6",
  "#fffbff",
];

export default function Tools() {
  return (
    <ToolGrid>
      <button onClick={() => (window.pixel.color = "#000000")}>Pencil</button>
      <button>Line</button>
      <button>Fill</button>
      <button onClick={() => (window.pixel.color = "#ffffff")}>Erase</button>
      {COLORS.map((color) => (
        <button
          key={color}
          className="color"
          style={{ background: color }}
          onClick={() => (window.pixel.color = color)}
        ></button>
      ))}
    </ToolGrid>
  );
}
