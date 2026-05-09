import styled from "@emotion/styled";
import Window from "../Window";
import { WINDOW_IDS } from "../../lib/windowIds";

const Inner = styled.div`
  width: 216px;
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

export function AboutWindow() {
  return (
    <Window
      title="About Pixel Paint"
      startClosed
      alwaysOnTop
      id={WINDOW_IDS.about}
    >
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
      </Inner>
    </Window>
  );
}
