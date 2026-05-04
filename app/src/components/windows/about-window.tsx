import styled from "@emotion/styled";
import Window from "../Window";
import { useWindowStore } from "../../stores/windowStore";

const Inner = styled.div`
  width: 320px;
  padding: 16px;
  font-family: var(--chicago);
  font-size: 12px;
  background: var(--mac-white);

  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: stretch;

  h1,
  p {
    margin: 0 0 8px;
  }

  h1 {
    font-family: var(--redaction);
    font-size: 18px;
    text-align: center;
    margin-bottom: 12px;
  }

  h2 {
    font-family: var(--chicago);
    font-size: 12px;
    margin: 8px 0 4px;
  }

  p {
    font-size: 12px;
    line-height: 1.5;
  }

  footer {
    margin-top: 10px;
    padding: 6px 0 8px;
    color: var(--mac-dark-gray);
    font-size: 10px;
    text-align: center;
    line-height: 1.3;
    border-top: 1px solid var(--mac-black);
  }

  a {
    color: inherit;
    text-decoration: underline;
  }

  ul {
    color: var(--gray-600);
    padding-left: 16px;
    margin: 0;
    font-size: 11px;
    line-height: 1.5;
  }
`;

const MacButton = styled.button`
  all: unset;
  box-sizing: border-box;
  display: block;
  width: 80px;
  height: 20px;
  margin: 6px auto 0;
  text-align: center;
  line-height: 18px;
  font-family: var(--chicago);
  font-size: 12px;
  cursor: default;

  background: var(--mac-white);
  color: var(--mac-black);
  border: 2px solid var(--mac-black);
  border-radius: 6px;

  /* Default button double-border ring */
  outline: 1px solid var(--mac-black);
  outline-offset: 1px;

  &:active {
    background: var(--mac-black);
    color: var(--mac-white);
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
        <MacButton
          onClick={() => {
            removeWindow("about");
          }}
        >
          OK
        </MacButton>
      </Inner>
    </Window>
  );
}
