import styled from "@emotion/styled";
import Window from "../Window";
import { useWindowStore } from "../../stores/windowStore";

const Inner = styled.div`
  width: 40ch;
  padding: 2.5rem 1rem 1.5rem;
  font-size: 1rem;

  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: stretch;

  h1,
  p {
    margin: 0 0 0.5rem;
  }

  h1 {
    font-family: var(--redaction);
    text-align: center;
    margin-bottom: 1.25rem;
  }

  h2 {
    font-size: 1rem;
    margin: 0.5rem 0 0.25rem;
  }

  footer {
    margin-top: 1rem;
    padding: 0.25rem 0 1rem;
    color: var(--gray-500);
    font-size: 1rem;
    text-align: center;
    line-height: 1.25;
  }

  a {
    color: inherit;
    text-decoration-style: dotted;
  }

  ul {
    color: var(--gray-600);
    padding-left: 1rem;
    margin: 0;
    line-height: 1.5;
  }

  button {
    width: min-content;
    margin: 0 auto;
    padding: 0.25rem 1rem;
    border: 2px solid black;
    box-shadow: 1px 1px black;
    font-family: var(--chicago);
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
  const { removeWindow } = useWindowStore();

  return (
    <Window startClosed alwaysOnTop id="about">
      <Inner>
        <h1>Pixel Paint</h1>
        <p>
          Inspired by MacPaint and Mario Paint. Built by Siraj Chokshi. Read
          more <a href="#">here</a> or look under the hood on{" "}
          <a href="https://github.com/sirajchokshi/paint">Github</a>.
        </p>
        <h2>Typography:</h2>
        <ul>
          <li>
            ChiKareGo Font (
            <a
              href="http://www.suppertime.co.uk/blogmywiki/2017/04/chicago/"
              target="_blank"
            >
              Giles Booth
            </a>
            )
          </li>
          <li>
            Redaction 35 (
            <a href="https://www.redaction.us/" target="_blank">
              Jeremy Mickel
            </a>
            )
          </li>
        </ul>

        <footer>
          &copy; Copyright 2023 Siraj Chokshi.
          <br />
          All rights reserved.
        </footer>
        <button
          onClick={() => {
            removeWindow("about");
          }}
        >
          OK
        </button>
      </Inner>
    </Window>
  );
}
