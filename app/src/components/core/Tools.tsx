import styled from "@emotion/styled";

const ToolGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(1, 1fr); // change to 2 columns for icons
    gap: 0.25rem;
    padding: .25rem;

    button.color {
        border: 1px outset grey;
        background: lightgrey;
    }
`;


export default function Tools() {
  return <ToolGrid>
    <button>Pencil</button>
    <button>Line</button>
    <button>Fill</button>
    <button>Erase</button>
  </ToolGrid>
}