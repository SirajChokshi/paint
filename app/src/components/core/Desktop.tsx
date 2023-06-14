import styled from "@emotion/styled"
import { SaveFile, useFileStore } from "../../stores/fileStore"
import { MouseEvent, useState } from "react"

const DesktopWrapper = styled.div`
    position: absolute;
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

    display: flex;
    flex-flow: column;

    padding: 30px;
`

const DesktopIconWrapper = styled.button`
    all: unset;

    .icon {
        width: 32px;
        height: 32px;
        background: red;
    }

    [data-active="true"] {
        .icon {
            opacity: 0.5;
        }

        span {
            background: blue;
            color: white;
        }
    }
`

export function DesktopIcon(props: SaveFile & {onClick: (e: MouseEvent) => void, active: boolean}) {
    return <DesktopIconWrapper onClick={()  => props.onClick} data-active={props.active}>
        <div className="icon">
            TXT
        </div>
        <span>
            {props.name}
        </span>
    </DesktopIconWrapper>
}
    

export default function Desktop() {
    const { files } = useFileStore()
    const [active, setActive] = useState<SaveFile | null>(null)

    const handleClickFactory = (file: SaveFile) => 
        (e: MouseEvent) => {
            e.stopPropagation()
            setActive(file)
        }

    return <DesktopWrapper>
        {
            files.map((file) =>
                <DesktopIcon
                    key={file.name + file.date}
                    onClick={handleClickFactory(file)}
                    active={active ? active.name + active.date === file.name + file.date : false}
                    {...file}
                />
            )
        }
    </DesktopWrapper>
}