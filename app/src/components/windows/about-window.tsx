import styled from "@emotion/styled";
import Window from "../Window";

const Inner = styled.div`
  width: 30ch;
  padding: 2rem 1rem 1.5rem;
  gap: 0.5rem;

  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;

  h1,
  p {
    margin: 0;
  }

  footer {
    padding: 0.25rem 0 1rem;
    color: var(--gray-500);
    font-size: 0.75rem;
  }

  a {
    color: inherit;
    text-decoration-style: dotted;
  }

  button {
    width: min-content;
    margin: 0 auto;
    padding: 0.25rem 1rem;
    border: 2px solid black;
    box-shadow: 1px 1px black;
    font-family: var(--redaction-50);
    background: var(--gray-0);
    color: black;
    font-weight: bold;
    cursor: pointer;
    border-radius: 20%;

    &:hover {
      background: var(--gray-100);
    }

    &:active {
      background: var(--gray-999);
      color: white;
    }
  }
`;

export function AboutWindow() {
  return (
    <Window alwaysOnTop>
      <Inner>
        <h1>Pixel Paint</h1>
        <p>
          Inspired by MacPaint and Mario Paint. Built by Siraj Chokshi. Read
          more <a href="#">here</a> or look under the hood on{" "}
          <a href="https://github.com/sirajchokshi/paint">Github</a>.
        </p>
        <footer>
          &copy; Copyright 2023 Siraj Chokshi. All rights reserved.
        </footer>
        <button>OK</button>
      </Inner>
    </Window>
  );
}
