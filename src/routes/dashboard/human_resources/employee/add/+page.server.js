import * as db from "$lib/util/hr/db/mysql";
import { genRD, generateEmail, hasNoNumbers, isValidPhoneNumber, isValidDate, isValidYear, padZeros } from "$lib/util/hr/utilsHR";
import { sexOptions, civilStatusOptions, highestLevelOfEducationOptions } from '$lib/util/hr/selectOptions.js';
import { fail } from "@sveltejs/kit";

export async function load() {
    try {

        let q = {
            fields: ['Employee.Employee_ID', 'Employee.Employee_FirstName', 'Employee.Employee_LastName'],
            alias: null,
            from: 'Employee',
            where: null,
            groupBy: null,
            having: null,
            orderBy: null
        }

        return db.get(q);
    } catch (error) {
        console.error('Got an Error!!!');
        console.log(error);
        return error;
    }
}

export const actions = {
    insert: async ({ request }) => {
        try {
            const formData = await request.formData();

            let employee = getEmployee(formData);
            let pds = await getPDS(formData);

            const validation = await validateData(employee, pds);
            if (!validation.pass) {
                return fail(400, {
                    error: validation.error,
                    employee,
                    pds
                });
            }

            const employeeID = await generateEmployeeID(employee);

            addEmployee(employee, employeeID);
            addPDS(pds, employeeID);

            return {
                success: "Success IDK haha"
            };

        } catch (e) {
            console.error("Error occured", e.message);
        }
    }
}

function getEmployee(formData) {
    return {
        Employee_FirstName: formData.get('first-name'),
        Employee_MiddleName: formData.get('middle-name'),
        Employee_LastName: formData.get('last-name'),
        Employee_DateOfHire: formData.get('date-of-hire'),
        Employee_ReportsTo: formData.get('reports-to').length > 0 ? formData.get('reports-to') : 'NULL'
    }
}

async function getPDS(formData) {
    const fname = formData.get('first-name');
    const mname = formData.get('middle-name');
    const lname = formData.get('last-name');
    return {
        Employee_Email: await generateUniqueEmail(fname, mname, lname),
        Employee_Address: formData.get('address'),
        Employee_ContactNumber: formData.get('contact-number'),
        Employee_DateOfBirth: formData.get('date-of-birth'),
        Employee_PlaceOfBirth: formData.get('place-of-birth'),
        Employee_Sex: formData.get('sex') ?? "",
        Employee_CivilStatus: formData.get('civil-status') ?? "",
        Employee_Citizenship: formData.get('citizenship'),
        Employee_HighestLevelOfEducation: formData.get('highest-level-of-education') ?? "",
        Employee_School: formData.get('school'),
        Employee_YearGraduated: formData.get('year-graduated'),
        Employee_PhilHealthID: formData.get('philhealth-id'),
        Employee_SSSID: formData.get('sss-id'),
        Employee_PagIBIGID: formData.get('pagibig-id'),
        Emergency_ContactName: formData.get('emergency-contact-name'),
        Emergency_ContactRelationship: formData.get('emergency-contact-relationship'),
        Emergency_ContactNumber: formData.get('emergency-contact-number')
    }
}

async function generateEmployeeID(employee) {
    let ids = await getEmployeeIDs();
    let year = (new Date(employee.Employee_DateOfHire).getFullYear()).toString()
    let id = year + genRD(4);

    if (!ids.includes(parseInt(id))) return id;

    let num = 0;
    while (ids.includes(parseInt(id))) {
        id = year + padZeros(num, 4);
        num++;
    }
    return id;
}

async function generateUniqueEmail(fname, mname, lname) {
    let emails = await getEmails();
    let email = generateEmail(fname, mname, lname);

    if (!emails.includes(email)) return email;

    const [username, domain] = email.split('@');

    let num = genRD(1);
    while (emails.includes(email)) {
        email = username + num.toString() + '@' + domain;
        num++;
    }
    return email;

}

function addEmployee(employee, employeeId) {
    const table = 'Employee';
    const fields = ['Employee_ID', 'Employee_FirstName', 'Employee_MiddleName', 'Employee_LastName', 'Employee_DateOfHire', 'Employee_ReportsTo'];
    const values = [employeeId, employee.Employee_FirstName, employee.Employee_MiddleName, employee.Employee_LastName, employee.Employee_DateOfHire, employee.Employee_ReportsTo];

    db.add({ table, fields, values });
}

function addPDS(pds, employeeId) {
    const table = 'PDS';
    const fields = ['Employee_ID', 'Employee_Email', 'Employee_Address', 'Employee_ContactNumber', 'Employee_DateOfBirth', 'Employee_PlaceOfBirth', 'Employee_Sex', 'Employee_CivilStatus', 'Employee_Citizenship', 'Employee_HighestLevelOfEducation', 'Employee_School', 'Employee_YearGraduated', 'Employee_PhilHealthID', 'Employee_SSSID', 'Employee_PagIBIGID', 'Emergency_ContactName', 'Emergency_ContactRelationship', 'Emergency_ContactNumber'];
    const values = [employeeId, pds.Employee_Email, pds.Employee_Address, pds.Employee_ContactNumber, pds.Employee_DateOfBirth, pds.Employee_PlaceOfBirth, pds.Employee_Sex, pds.Employee_CivilStatus, pds.Employee_Citizenship, pds.Employee_HighestLevelOfEducation, pds.Employee_School, pds.Employee_YearGraduated, pds.Employee_PhilHealthID, pds.Employee_SSSID, pds.Employee_PagIBIGID, pds.Emergency_ContactName, pds.Emergency_ContactRelationship, pds.Emergency_ContactNumber];

    db.add({ table, fields, values });
}

async function validateData(employee, pds) {
    let result = {
        pass: true,
        error: {}
    }

    if (!employee.Employee_FirstName) {
        result.pass = false;
        result.error['first-name'] = "Missing First Name\n";
    } else if (!hasNoNumbers(employee.Employee_FirstName)) {
        result.pass = false;
        result.error['first-name'] = "Invalid First Name\n";
    }

    if (employee.Employee_MiddleName && !hasNoNumbers(employee.Employee_MiddleName)) {
        result.pass = false;
        result.error['middle-name'] = "Invalid Middle Name\n";
    }

    if (!employee.Employee_LastName) {
        result.pass = false;
        result.error['last-name'] = "Missing Last Name\n";
    } else if (!hasNoNumbers(employee.Employee_LastName)) {
        result.pass = false;
        result.error['last-name'] = "Invalid Last Name\n";
    }

    if (!employee.Employee_DateOfHire) {
        result.pass = false;
        result.error['date-of-hire'] = "Missing Date of Hire";
    } else if (!isValidDate(employee.Employee_DateOfHire)) {
        result.pass = false;
        result.error['date-of-hire'] = "Invalid Date";
    }

    if (employee.Employee_ReportsTo && employee.Employee_ReportsTo != 'NULL' && !(await employeeIDExists(employee.Employee_ReportsTo))) {
        result.pass = false;
        result.error['reports-to'] = "Invalid ID";
    }

    if (pds.Employee_ContactNumber && !isValidPhoneNumber(pds.Employee_ContactNumber)) {
        result.pass = false;
        result.error['contact-number'] = "Invalid Phone Number Format";
    }

    if (pds.Employee_DateOfBirth && !isValidDate(pds.Employee_DateOfBirth)) {
        result.pass = false;
        result.error['date-of-hire'] = "Invalid Date";
    }

    if (pds.Employee_YearGraduated && !isValidYear(pds.Employee_YearGraduated)) {
        result.pass = false;
        result.error['year-graduated'] = "Invalid Year";
    }

    if (pds.Emergency_ContactName && !hasNoNumbers(pds.Emergency_ContactName)) {
        result.pass = false;
        result.error['emergency-contact-name'] = "Invalid Name";
    }

    if (pds.Emergency_ContactNumber && !isValidPhoneNumber(pds.Emergency_ContactNumber)) {
        result.pass = false;
        result.error['emergency-contact-number'] = "Invalid Phone Number";
    }

    if (pds.Employee_Sex && !sexOptions.includes(pds.Employee_Sex)) {
        result.pass = false;
        result.error['sex'] = "Invalid Input";
    }

    if (pds.Employee_CivilStatus && !civilStatusOptions.includes(pds.Employee_CivilStatus)) {
        result.pass = false;
        result.error['civil-status'] = "Invalid Input";
    }

    if (pds.Employee_HighestLevelOfEducation && !highestLevelOfEducationOptions.includes(pds.Employee_HighestLevelOfEducation)) {
        result.pass = false;
        result.error['highest-level-of-education'] = "Invalid Input";
    }

    return result;
}

async function employeeIDExists(employeeID) {
    let ids = await getEmployeeIDs();
    if (ids.includes(parseInt(employeeID))) {
        return true;
    }
    else {
        return false;
    }
}

async function getEmployeeIDs() {
    let q = {
        fields: ['Employee_ID'],
        alias: null,
        from: 'Employee',
        where: null,
        groupBy: null,
        having: null,
        orderBy: null
    }

    let values = (await db.get(q)).data;
    return values.map(item => item.Employee_ID);
}

async function getEmails() {
    let q = {
        fields: ['Employee_Email'],
        alias: null,
        from: 'PDS',
        where: null,
        groupBy: null,
        having: null,
        orderBy: null
    }

    let values = (await db.get(q)).data;
    return values.map(item => item.Employee_Email);
}