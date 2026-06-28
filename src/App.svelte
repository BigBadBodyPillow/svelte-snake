<script lang="ts">
  import { onMount } from 'svelte'
  import type { SnakePositionType, Direction, Cell, DebugElement, GameElement } from './types'

  let snakePosition: SnakePositionType = $state([0, 0])

  const dimensions = 9
  const cellWidth = 28 /* px */
  const debounceDelay = 250 // ms
  const defaultRow = 5
  const defaultCol = 5

  const cells: Cell[] = Array.from({ length: dimensions ** 2 }, (_, index) => ({
    id: index,
    row: Math.floor(index / dimensions) + 1,
    col: (index % dimensions) + 1
  }))

  // game elements
  let board: GameElement = null
  let snake: GameElement = null
  let apple: GameElement = null

  //for debug
  let snakeXElement: DebugElement = null
  let snakeYElement: DebugElement = null
  let headRowElement: DebugElement = null
  let headColElement: DebugElement = null
  let cellElement: DebugElement = null

  const lastMoveTime: Map<Direction, number> = new Map()

  const canMove = (direction: Direction): boolean => {
    const now = Date.now()
    const lastTime = lastMoveTime.get(direction) ?? 0

    if (now - lastTime >= debounceDelay) {
      lastMoveTime.set(direction, now)
      return true
    }
    return false
  }

  const setBoardDimensions = () => {
    if (!board) return
    board.style.gridTemplateColumns = `repeat(${dimensions}, minmax(0, 1fr))`
  }

  const getCurrentCell = () => {
    const col = Math.floor(snakePosition[0] / cellWidth) + 1
    const rowFromBottom = Math.floor(snakePosition[1] / cellWidth) + 1
    const row = dimensions - rowFromBottom + 1
    const index = (row - 1) * dimensions + col

    return { row, col, index }
  }

  const setDefaultCell = (row: number, col: number) => {
    if (row < 1 || row > dimensions || col < 1 || col > dimensions) return

    const x = (col - 1) * cellWidth
    const y = (dimensions - row) * cellWidth
    snakePosition = [x, y]

    if (snake) {
      snake.style.left = `${x}px`
      snake.style.bottom = `${y}px`
    }
  }

  const calculateMove = (stepX: number, stepY: number): SnakePositionType => {
    const max = (dimensions - 1) * cellWidth
    const moveX = stepX * cellWidth
    const moveY = stepY * cellWidth

    // limit movement to be between row / col, 0 - 8
    const newX = Math.min(Math.max(snakePosition[0] + moveX, 0), max)
    const newY = Math.min(Math.max(snakePosition[1] + moveY, 0), max)

    return [newX, newY]
  }

  const move = (stepX: number, stepY: number) => {
    const [x, y] = calculateMove(stepX, stepY)
    snakePosition = [x, y]

    if (snake) {
      snake.style.left = `${x}px`
      snake.style.bottom = `${y}px`
    }
  }

  const moveRight = () => {
    // if (canMove('RIGHT')) move(1, 0)
    canMove('RIGHT') ? move(1, 0) : null
  }
  const moveLeft = () => {
    // if (canMove('LEFT')) move(-1, 0)
    canMove('LEFT') ? move(-1, 0) : null
  }
  const moveUp = () => {
    // if (canMove('UP')) move(0, 1)
    canMove('UP') ? move(0, 1) : null
  }
  const moveDown = () => {
    // if (canMove('DOWN')) move(0, -1)
    canMove('DOWN') ? move(0, -1) : null
  }

  const handleMove = (event: KeyboardEvent) => {
    switch (event.key.toUpperCase()) {
      case 'W':
        moveUp()
        break
      case 'A':
        moveLeft()
        break
      case 'S':
        moveDown()
        break
      case 'D':
        moveRight()
        break
      default:
        break
    }
  }

  const drawDebug = () => {
    const newDiv = document.createElement('div')

    newDiv.classList.add('debug-menu')
    newDiv.style.position = 'absolute'
    newDiv.style.left = '0'
    newDiv.style.top = '0'
    newDiv.style.width = '200px'
    newDiv.style.padding = '12px'
    newDiv.style.fontFamily = 'Space Grotesk'
    newDiv.style.backgroundColor = 'RGBA(0,0,0,0.8)'
    newDiv.style.color = 'white'
    newDiv.style.fontVariantNumeric = 'tabular-nums'

    const positionFieldset = document.createElement('fieldset')
    positionFieldset.style.border = '2px solid gray'
    positionFieldset.style.padding = '6px'

    const positionLegend = document.createElement('legend')
    positionLegend.textContent = 'snake position'
    positionLegend.style.marginLeft = '10px'

    snakeXElement = document.createElement('p')
    // snakeXElement.textContent = `x : ${snakePosition[0]}`
    snakeYElement = document.createElement('p')
    // snakeYElement.textContent = `y : ${snakePosition[1]}`
    headRowElement = document.createElement('p')
    // headRowElement.textContent = `row : ${getCurrentCell().row}`
    headColElement = document.createElement('p')
    // headColElement.textContent = `col : ${getCurrentCell().col}`
    cellElement = document.createElement('p')
    // cellElement.textContent = `cell : ${getCurrentCell().index}`

    const miscFieldset = document.createElement('fieldset')
    miscFieldset.style.border = '2px solid gray'
    miscFieldset.style.padding = '6px'

    const miscLegend = document.createElement('legend')
    miscLegend.textContent = 'misc'
    miscLegend.style.marginLeft = '10px'

    const gridSize = document.createElement('p')
    gridSize.textContent = `grid size : ${dimensions} x ${dimensions}`

    const cellSize = document.createElement('p')
    cellSize.textContent = `cell size : ${cellWidth}px`

    const debounceDelayElement = document.createElement('p')
    debounceDelayElement.textContent = `debounce : ${debounceDelay}ms`

    document.body.appendChild(newDiv)
    newDiv.appendChild(positionFieldset)
    positionFieldset.appendChild(positionLegend)
    positionFieldset.appendChild(snakeXElement)
    positionFieldset.appendChild(snakeYElement)
    positionFieldset.appendChild(headRowElement)
    positionFieldset.appendChild(headColElement)
    positionFieldset.appendChild(cellElement)

    newDiv.appendChild(miscFieldset)
    miscFieldset.appendChild(debounceDelayElement)
    miscFieldset.appendChild(miscLegend)
    miscFieldset.appendChild(gridSize)
    miscFieldset.appendChild(cellSize)
  }

  const updateDebug = () => {
    if (!snakeXElement || !snakeYElement || !headRowElement || !headColElement || !cellElement) {
      return
    }

    snakeXElement.textContent = `x : ${snakePosition[0]}px`
    snakeYElement.textContent = `y : ${snakePosition[1]}px`
    const { row, col, index } = getCurrentCell()
    headRowElement.textContent = `row : ${row}`
    headColElement.textContent = `col : ${col}`
    cellElement.textContent = `cell : ${index}`
  }

  onMount(() => {
    setBoardDimensions()
    setDefaultCell(defaultRow, defaultCol)
    drawDebug()
    updateDebug()
  })

  $effect(() => {
    updateDebug()
  })
</script>

<svelte:window onkeypress={handleMove} />

<!-- prettier-ignore -->
<main class="flex flex-col items-center justify-center gap-8 h-screen p-2.5">
  <div class="board grid relative" bind:this={board} draggable="false">
    {#each cells as cell}
      <div
        class="cell h-7 w-7 select-none border border-amber-950 bg-amber-400 transition-all duration-50 hover:scale-90 hover:bg-amber-500"
        data-row={cell.row}
        data-col={cell.col}
      ></div>
    {/each}

    <div class="snake absolute z-10 m-1 h-5 w-5 bg-green-500 pointer-events-none" bind:this={snake}></div>
    <div class="apple absolute z-9 m-1.5 h-4 w-4 rounded-full bg-red-500 pointer-events-none" bind:this={apple}></div>
  </div>
</main>
