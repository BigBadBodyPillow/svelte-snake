<script lang="ts">
  // import svelteLogo from './assets/svelte.svg'
  // import viteLogo from './assets/vite.svg'
  // import heroImg from './assets/hero.png'
  import Counter from './components/Counter.svelte'


  let board: HTMLElement;
  let dimensions = 8
  
  const setBoardDimensions = (dimension:Number) => {
    board.style.gridTemplateColumns = `repeat(${dimension}, minmax(0, 1fr))`
  }
    
  // when window is loaded
  $effect(() => {
    setBoardDimensions(dimensions)
  })

</script>

<main class="flex flex-col items-center justify-center gap-8 h-screen p-2.5">
    <div class=" flex flex-col items-center gap-2">
      <h1>text</h1>
      <Counter class="bg-red-500 p-2 rounded-lg text-amber-50" label="idk" />
    </div>

    <div class="board grid " bind:this={board}>
      <!-- x by x grid -->
      {#each {length: dimensions ** 2} as i }
        <div class="w-7 h-7 bg-amber-400 border border-amber-950 hover:scale-90 hover:bg-amber-500 transition-all duration-50" ></div>
      {/each}
    </div>
  
</main>
