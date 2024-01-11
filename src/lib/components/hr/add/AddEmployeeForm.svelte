<script>
	import EmployeeFields from '../form_fields/EmployeeFields.svelte';
	import PDSFields from '../form_fields/PDSFields.svelte';
	import { Button } from 'flowbite-svelte';

	export let form, storedReportsTo;
</script>

<form method="post" action="?/insert">
	<EmployeeFields 
		employee = {form?.employee ?? null} 
		storedReportsTo = {storedReportsTo}
		error = {form?.error ?? {}}/>
	<PDSFields
		pds={form?.pds ?? null} 
		error = {form?.error ?? {}}/>
	<Button type="submit">Add New Employee</Button>
</form>

<style>
</style>
