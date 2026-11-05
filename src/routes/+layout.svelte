<script lang="ts">
	import '../app.css';
	let { children } = $props();
</script>

<a class="skip" href="#content">К содержанию</a>
{@render children()}
<footer class="site-footer">
	<p>
		Демонстрация. Мероприятие не назначено.
	</p>
</footer>
