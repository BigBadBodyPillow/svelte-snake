<script lang="ts">
const {class: className = ""} = $props()

  let count: number = $state(0)
  const increment = () => {
    count += 1
  }
</script>

<button type="button" class="counter {className}" onclick={increment}>
  Count is {count}
</button>

<style>
button{
  cursor: pointer;
  &:hover {
    transform: scale(0.9);
  }
}
</style>