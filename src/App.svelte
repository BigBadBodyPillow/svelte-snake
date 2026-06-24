<script lang="ts">
  // import svelteLogo from './assets/svelte.svg'
  // import viteLogo from './assets/vite.svg'
  // import heroImg from './assets/hero.png'
  import Counter from './components/Counter.svelte'
  import type { SnakePositionType } from './types'

  let snakePostion: SnakePositionType = $state([0, 0])

  const dimensions: number = 8
  const cellWidth = 28 /* px */
  const debounceDelay = 250 // ms
  const defaultRow = 8
  const defaultCol = 1

  let board: HTMLElement
  let snake: HTMLElement
  let snakeXElement: HTMLParagraphElement //for debug
  let snakeYElement: HTMLParagraphElement //for debug
  let headRowElement: HTMLParagraphElement //for debug
  let headColElement: HTMLParagraphElement //for debug
  let cellElement: HTMLParagraphElement //for debug

  const lastMoveTime = new Map<string, number>()

  const canMove = (direction: string): boolean => {
    const now = Date.now()
    const lastTime = lastMoveTime.get(direction) ?? 0
    if (now - lastTime >= debounceDelay) {
      lastMoveTime.set(direction, now)
      return true
    }
    return false
  }

  const setBoardDimensions = (dimension: number) => {
    board.style.gridTemplateColumns = `repeat(${dimension}, minmax(0, 1fr))`
  }

  // when window is loa1ded
  $effect(() => {
    setBoardDimensions(dimensions)
    setDefaultCell(defaultRow, defaultCol)
  })

  const getCurrentCell = () => {
    const col = Math.floor(snakePostion[0] / cellWidth) + 1
    const rowFromBottom = Math.floor(snakePostion[1] / cellWidth) + 1
    const row = dimensions - rowFromBottom + 1
    const index = (row - 1) * dimensions + col

    return { row, col, index }
  }

  const setDefaultCell = (row: number, col: number) => {
    if (row < 1 || row > dimensions || col < 1 || col > dimensions) {
      return
    }

    const x = (col - 1) * cellWidth
    const y = (dimensions - row) * cellWidth

    snakePostion = [x, y]
    snake.style.left = `${x}px`
    snake.style.bottom = `${y}px`
  }

  const calculateMove = (stepX: number, stepY: number) => {
    const max = (dimensions - 1) * cellWidth // it starts in 1 so max is 224 - 28 or 7x28 = 196

    const moveX = stepX * cellWidth
    const moveY = stepY * cellWidth

    // limit movement to be between row / col 0 - 8
    const newX = Math.min(Math.max(snakePostion[0] + moveX, 0), max)
    const newY = Math.min(Math.max(snakePostion[1] + moveY, 0), max)

    return [newX, newY]
  }

  const move = (stepX: number, stepY: number) => {
    const [x, y] = calculateMove(stepX, stepY)

    snakePostion = [x, y]
    snake.style.left = `${x}px`
    snake.style.bottom = `${y}px`
  }

  const moveRight = () => {
    if (canMove('RIGHT')) move(1, 0)
  }
  const moveLeft = () => {
    if (canMove('LEFT')) move(-1, 0)
  }
  const moveUp = () => {
    if (canMove('UP')) move(0, 1)
  }
  const moveDown = () => {
    if (canMove('DOWN')) move(0, -1)
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
    snakeXElement.textContent = `x : ${snakePostion[0]}`

    snakeYElement = document.createElement('p')
    snakeYElement.textContent = `y : ${snakePostion[1]}`

    headRowElement = document.createElement('p')
    headRowElement.textContent = `row : ${getCurrentCell().row}`

    headColElement = document.createElement('p')
    headColElement.textContent = `col : ${getCurrentCell().col}`

    cellElement = document.createElement('p')
    cellElement.textContent = `cell : ${getCurrentCell().index}`

    const miscFieldset = document.createElement('fieldset')
    miscFieldset.style.border = '2px solid gray'
    miscFieldset.style.padding = '6px'

    const miscLegend = document.createElement('legend')
    miscLegend.textContent = 'misc'
    miscLegend.style.marginLeft = '10px'

    const gridSize = document.createElement('p')
    gridSize.textContent = `grid size : ${dimensions} x ${dimensions}`

    const cellSize = document.createElement('p')
    cellSize.textContent = `grid size : ${cellWidth}px`

    const debounceDelayElement = document.createElement('p')
    debounceDelayElement.textContent = `debounce : ${debounceDelay}`

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

  drawDebug()

  const updateDebug = () => {
    snakeXElement.textContent = `x : ${snakePostion[0]}`
    snakeYElement.textContent = `y : ${snakePostion[1]}`
    const { row, col, index } = getCurrentCell()
    headRowElement.textContent = `row : ${row}`
    headColElement.textContent = `col : ${col}`
    cellElement.textContent = `cell : ${index}`
  }

  $effect(() => {
    updateDebug()
  })
</script>

<svelte:window onkeypress={handleMove} />
<main class="flex flex-col items-center justify-center gap-8 h-screen p-2.5">
  <div class=" flex flex-col items-center gap-2">
    <h1>text</h1>
    <Counter class="bg-red-500 p-2 rounded-lg text-amber-50" label="idk" />
  </div>

  <!-- prettier-ignore -->
  <div class="board grid relative" bind:this={board} draggable="false">
      <!-- x by x grid -->
      {#each {length: dimensions ** 2} as _, i }
        <div class="cell w-7 h-7 bg-amber-400 border border-amber-950 hover:scale-90 hover:bg-amber-500 transition-all duration-50 select-none" 
        data-row={`${Math.floor(i / dimensions) + 1}`} // e.g cell 10(counting from 1) x is 9 / 8 + 1 not count remainder = 2
        data-col={`${(i % dimensions) + 1}`} // e.g cell 10(counting from 1) y is 9 % 8 + 1 = 2 so 10:[x=2,y=2]
        ></div>
      {/each}

      <div class="snake bg-green-500 w-5 h-5 absolute m-1 pointer-events-none" bind:this={snake}></div>
    </div>
</main>
