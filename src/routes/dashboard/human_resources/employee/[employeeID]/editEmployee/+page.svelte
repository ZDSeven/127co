<script>
  import EditEmployeeForm from "$lib/components/hr/edit/EditEmployeeForm.svelte";

  export let form;
  export let data;

  let employee = data.data[0];
  let storedReportsTo = []
  data.data.map((e)=>(storedReportsTo.push({
    Employee_ID: e.Employee_ID,
    Employee_FirstName: e.Employee_FirstName,
    Employee_LastName: e.Employee_LastName,
  })))
</script>

<hr />
<h1>Editing Employee ID: {employee.Employee_ID}</h1>
<EditEmployeeForm {employee} {form} {storedReportsTo}/>
<hr />
