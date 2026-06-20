<script >
const {class: className = "", label = ""} = $props() 

  let count= $state(0)
  const increment = () => {
    count += 1
  }
</script>

<button type="button" class="counter  cursor-pointer hover:scale-[0.95] {className} " onclick={increment}>
  Count of {label? label : "something"} is {count}
</button>