<script>
  import AddEmployeeForm from "$lib/components/hr/add/AddEmployeeForm.svelte";

  export let form, data;
</script>

<hr />
<AddEmployeeForm {form} storedReportsTo={data.data} />
<hr />
