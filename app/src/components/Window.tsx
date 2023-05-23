import styled from '@emotion/styled'
import { PropsWithChildren, useRef, useState } from 'react'

interface Position {
    x: number
    y: number
}

const WindowWrapper = styled.div<Position & { z: number }>`
    position: fixed;
    top: 0;
    left: 0;
    min-width: 20vw;
    max-width: 60vw;

    ${({ x, y }) => `transform: translate(${x}px, ${y}px);`}
    z-index: ${({ z }) => z};

    background: white;
    color: black;
    border: 2px solid black;
    overflow: auto;

    display: grid;
    grid-template-columns: 1fr;
    grid-template-rows: min-content 1fr;

    .window__title {
        height: 1.625rem;
        padding: 0 0.5rem;
        user-select: none;
        font-family: monospace;
        font-size: 0.75rem;
        font-weight: 600;
        line-height: 1.625rem;
        border-bottom: 1px solid black;
        cursor: grab;
    }
`

interface WindowProps {
    title?: string
}

export default function Window({ children, title = 'Untitled' }: PropsWithChildren<WindowProps>) {
    const [position, setPosition] = useState<Position>({
        x: 0,
        y: 0,
    })

    const windowRef = useRef<HTMLDivElement>(null)
    const dragProps = useRef<any>()

    const initializeDrag = (event: React.MouseEvent) => {
        if (!windowRef.current) return

        const { target, clientX, clientY } = event
        const { offsetTop, offsetLeft } = target as HTMLDivElement
        const { left, top } = windowRef.current.getBoundingClientRect()

        dragProps.current = {
            dragStartLeft: left - offsetLeft,
            dragStartTop: top - offsetTop,
            dragStartX: clientX,
            dragStartY: clientY,
        }

        window.addEventListener('mousemove', startDragging, false)
        window.addEventListener('mouseup', stopDragging, false)
    }

    const startDragging = ({ clientX, clientY }: MouseEvent) => {
        setPosition({
            x: dragProps.current.dragStartLeft + clientX - dragProps.current.dragStartX,
            y: dragProps.current.dragStartTop + clientY - dragProps.current.dragStartY,
        })
    }

    const stopDragging = () => {
        window.removeEventListener('mousemove', startDragging, false)
        window.removeEventListener('mouseup', stopDragging, false)
    }

    return (
        <WindowWrapper
            className="window"
            x={position.x}
            y={position.y}
            z={99}
            ref={windowRef}
        >
            <div className="window__title" onMouseDown={initializeDrag}>
                {title}
            </div>
            {children}
        </WindowWrapper>
    )
}
