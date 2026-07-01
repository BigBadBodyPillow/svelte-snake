<script lang="ts">
  import { onMount } from 'svelte'
  import type { PositionType, Direction, Cell, DebugElement, GameElement } from './types'

  let snakePosition: PositionType = $state([0, 0])
  let applePosition: PositionType = $state([0, 0])
  let snakeSegments: PositionType[] = $state([])
  let eaten = $state(0)
  let appleVisible = true
  let eatenStatus: boolean

  const dimensions = 9
  const cellWidth = 28 /* px */
  const debounceDelay = 250 // ms
  const defaultRow = 5
  const defaultCol = 5
  const defaultAppleRow = 2
  const defaultAppleCol = 2
  const cells: Cell[] = Array.from({ length: dimensions ** 2 }, (_, index) => ({
    id: index,
    row: Math.floor(index / dimensions) + 1,
    col: (index % dimensions) + 1
  }))
  const lastMoveTime: Map<Direction, number> = new Map()

  //game elemnts
  let board: GameElement = null
  let apple: GameElement = null

  //debug
  let snakeXElement: DebugElement = null
  let snakeYElement: DebugElement = null
  let headRowElement: DebugElement = null
  let headColElement: DebugElement = null
  let cellElement: DebugElement = null
  let applesEaten: DebugElement = null
  let appleXElement: DebugElement = null
  let appleYElement: DebugElement = null
  let appleRowElement: DebugElement = null
  let appleColElement: DebugElement = null
  let appleCell: DebugElement = null
  let eatenStatusElement: DebugElement = null
  let appleButtonContainer: DebugElement = null
  let eatAppleButton: DebugElement = null
  let spawnAppleButton: DebugElement = null

  function checkMoveTimeout(direction: Direction): boolean {
    const now = Date.now()
    const lastTime = lastMoveTime.get(direction) ?? 0

    if (now - lastTime >= debounceDelay) {
      lastMoveTime.set(direction, now)
      return true
    }

    return false
  }

  function setBoardDimensions() {
    if (!board) return
    board.style.gridTemplateColumns = `repeat(${dimensions}, minmax(0, 1fr))`
  }

  function getCellFromPosition(position: PositionType) {
    const col = Math.floor(position[0] / cellWidth) + 1
    const rowFromBottom = Math.floor(position[1] / cellWidth) + 1
    const row = dimensions - rowFromBottom + 1
    const index = (row - 1) * dimensions + col

    return { row, col, index }
  }

  function getPositionFromCell(row: number, col: number): PositionType {
    const x = (col - 1) * cellWidth
    const y = (dimensions - row) * cellWidth

    return [x, y]
  }

  function setDefaultCell(row: number, col: number) {
    if (row < 1 || row > dimensions || col < 1 || col > dimensions) return

    const [x, y] = getPositionFromCell(row, col)
    const headPosition: PositionType = [x, y]

    snakeSegments = [headPosition]
    snakePosition = headPosition
  }

  function setApplePosition(row: number, col: number) {
    if (row < 1 || row > dimensions || col < 1 || col > dimensions) return

    const x = (col - 1) * cellWidth
    const y = (dimensions - row) * cellWidth
    applePosition = [x, y]

    if (apple) {
      apple.style.left = `${x}px`
      apple.style.bottom = `${y}px`
    }
  }

  function calculateMove(stepX: number, stepY: number, position: PositionType): PositionType {
    const max = (dimensions - 1) * cellWidth
    const moveX = stepX * cellWidth
    const moveY = stepY * cellWidth

    // limit movement to grid
    const newX = Math.min(Math.max(position[0] + moveX, 0), max)
    const newY = Math.min(Math.max(position[1] + moveY, 0), max)

    return [newX, newY]
  }

  function move(stepX: number, stepY: number) {
    if (snakeSegments.length === 0) return

    const tailPosition = snakeSegments[snakeSegments.length - 1]
    const headPosition = snakeSegments[0]
    const newHeadPosition = calculateMove(stepX, stepY, headPosition)
    const nextSegments: PositionType[] = [newHeadPosition]

    for (let index = 0; index < snakeSegments.length - 1; index++) {
      nextSegments.push(snakeSegments[index])
    }

    snakeSegments = nextSegments
    snakePosition = newHeadPosition
    checkEat(tailPosition)
  }

  function moveRight() {
    checkMoveTimeout('RIGHT') ? move(1, 0) : null
  }
  function moveLeft() {
    checkMoveTimeout('LEFT') ? move(-1, 0) : null
  }
  function moveUp() {
    checkMoveTimeout('UP') ? move(0, 1) : null
  }
  function moveDown() {
    checkMoveTimeout('DOWN') ? move(0, -1) : null
  }

  function handleMove(event: KeyboardEvent) {
    const headPosition = snakeSegments[0]
    const headCol = headPosition[0] / cellWidth + 1
    const headRow = headPosition[1] / cellWidth + 1

    switch (event.key.toUpperCase()) {
      case 'W':
        if (headRow < 9) moveUp()
        break
      case 'A':
        if (headCol > 1) moveLeft()
        break
      case 'S':
        if (headRow > 1) moveDown()
        break
      case 'D':
        if (headCol < 9) moveRight()
        break
      default:
        break
    }
  }

  function eatApple() {
    if (!apple || !appleVisible) return
    apple.style.display = 'none'
    appleVisible = false
    eaten++
    eatenStatus = true
    const tailPosition = snakeSegments[snakeSegments.length - 1]
    growSnake(tailPosition)
    updateDebug()
  }

  function growSnake(tailPosition?: PositionType) {
    if (!tailPosition) return
    snakeSegments = [...snakeSegments, tailPosition]
  }

  function spawnApple() {
    if (!apple) return
    appleVisible = true
    apple.style.display = 'block'
    eatenStatus = false

    const randomRow = Math.floor(Math.random() * dimensions) + 1
    const randomCol = Math.floor(Math.random() * dimensions) + 1
    setApplePosition(randomRow, randomCol)
    updateDebug()
    checkEat()
  }

  function checkEat(tailPosition?: PositionType) {
    if (!appleVisible) return
    const snakeIndex = getCellFromPosition(snakeSegments[0]).index
    const appleIndex = getCellFromPosition(applePosition).index
    if (snakeIndex === appleIndex) {
      eatApple()
    }
  }

  function drawDebug() {
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
    positionLegend.textContent = 'snake '
    positionLegend.style.marginLeft = '10px'

    snakeXElement = document.createElement('p')
    snakeYElement = document.createElement('p')
    headRowElement = document.createElement('p')
    headColElement = document.createElement('p')
    cellElement = document.createElement('p')
    applesEaten = document.createElement('p')

    const applePositionFieldset = document.createElement('fieldset')
    applePositionFieldset.style.border = '2px solid gray'
    applePositionFieldset.style.padding = '6px'

    const applePositionLegend = document.createElement('legend')
    applePositionLegend.textContent = 'apple'
    applePositionLegend.style.marginLeft = '10px'

    appleXElement = document.createElement('p')
    appleYElement = document.createElement('p')
    appleRowElement = document.createElement('p')
    appleColElement = document.createElement('p')
    appleCell = document.createElement('p')
    eatenStatusElement = document.createElement('p')

    appleButtonContainer = document.createElement('div')
    appleButtonContainer.style.display = 'flex'
    appleButtonContainer.style.justifyContent = 'space-between'
    appleButtonContainer.style.gap = '10px'
    eatAppleButton = document.createElement('button')
    eatAppleButton.textContent = 'eat'
    eatAppleButton.style.width = '100%'
    eatAppleButton.style.padding = '2px 6px'
    eatAppleButton.style.background = '#444444'
    eatAppleButton.addEventListener('click', eatApple)
    spawnAppleButton = document.createElement('button')
    spawnAppleButton.textContent = 'respawn'
    spawnAppleButton.style.width = '100%'
    spawnAppleButton.style.padding = '2px 6px'
    spawnAppleButton.style.background = '#444444'
    spawnAppleButton.addEventListener('click', spawnApple)

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
    positionFieldset.appendChild(applesEaten)

    newDiv.appendChild(applePositionFieldset)
    applePositionFieldset.appendChild(applePositionLegend)
    applePositionFieldset.appendChild(appleXElement)
    applePositionFieldset.appendChild(appleYElement)
    applePositionFieldset.appendChild(appleRowElement)
    applePositionFieldset.appendChild(appleColElement)
    applePositionFieldset.appendChild(appleCell)
    applePositionFieldset.appendChild(eatenStatusElement)
    applePositionFieldset.appendChild(appleButtonContainer)

    appleButtonContainer.appendChild(eatAppleButton)
    appleButtonContainer.appendChild(spawnAppleButton)

    newDiv.appendChild(miscFieldset)
    miscFieldset.appendChild(debounceDelayElement)
    miscFieldset.appendChild(miscLegend)
    miscFieldset.appendChild(gridSize)
    miscFieldset.appendChild(cellSize)
  }

  function updateDebug() {
    if (
      !snakeXElement ||
      !snakeYElement ||
      !headRowElement ||
      !headColElement ||
      !cellElement ||
      !applesEaten ||
      !appleXElement ||
      !appleYElement ||
      !appleRowElement ||
      !appleColElement ||
      !appleCell ||
      !eatenStatusElement
    )
      return

    const headPosition = snakeSegments[0]
    snakeXElement.textContent = `x : ${headPosition[0]}px`
    snakeYElement.textContent = `y : ${headPosition[1]}px`
    const snakeCell = getCellFromPosition(headPosition)
    headRowElement.textContent = `row : ${snakeCell.row}`
    headColElement.textContent = `col : ${snakeCell.col}`
    cellElement.textContent = `cell : ${snakeCell.index}`
    applesEaten.textContent = `eaten : ${eaten}`

    appleXElement.textContent = `x : ${applePosition[0]}px`
    appleYElement.textContent = `y : ${applePosition[1]}px`
    const appleCellPos = getCellFromPosition(applePosition)
    appleRowElement.textContent = `row : ${appleCellPos.row}`
    appleColElement.textContent = `col : ${appleCellPos.col}`
    appleCell.textContent = `cell : ${appleCellPos.index}`
    eatenStatusElement.textContent = `isEaten: ${eatenStatus}`
  }

  onMount(() => {
    setBoardDimensions()
    setDefaultCell(defaultRow, defaultCol)
    setApplePosition(defaultAppleRow, defaultAppleCol)
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

    {#each snakeSegments as segment, index}
      <div
        class={`absolute z-10 m-1 h-5 w-5 pointer-events-none ${index === 0 ? 'bg-green-500 z-100' : 'bg-green-400'}`}
        style:left={`${segment[0]}px`}
        style:bottom={`${segment[1]}px`}
      ></div>
    {/each}
    <div
      class="apple absolute z-9 m-1.5 h-4 w-4 rounded-full bg-red-500 pointer-events-none" bind:this={apple}
    ></div>
  </div>
</main>
