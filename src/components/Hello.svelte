<script>
	function handleSayHelloClick(e){
		e.preventDefault();

		alert('Hello!!');
	}
</script>


<button type="button" class="btn" on:click={handleSayHelloClick}>Say Hello</button>
