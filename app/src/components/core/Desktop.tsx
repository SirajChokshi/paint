import styled from "@emotion/styled"

export const Background = styled.div`
    position: fixed;
    top: -5px;
    left: -5px;
    width: calc(100% + 10px);
    height: calc(100% + 10px);
    user-select: none;

    filter: blur(1px);

    background: linear-gradient(
        45deg,
        #2f2fd4 25%,
        blue 25%,
        blue 50%,
        #2f2fd4 50%,
        #2f2fd4 75%,
        blue 75%,
        blue 100%
    );
    opacity: 0.8;
    z-index: 0;
    background-size: 0.5rem 0.5rem;
    animation: scan 5s linear infinite;

    @keyframes scan {
        0% {
            background-position: 0 0;
        }
        100% {
            background-position: -1rem 1rem;
        }
    }
`