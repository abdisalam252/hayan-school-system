// Native fetch is available in Node > 18

const API_URL = 'http://localhost:5002/api/teachers';

async function testTeachersApi() {
    console.log('🧪 Starting Teachers API Test...');

    // 1. GET (Initial)
    try {
        const res = await fetch(API_URL);
        if (!res.ok) throw new Error(`GET / failed: ${res.status}`);
        const initialTeachers = await res.json();
        console.log(`✅ GET /teachers passed. Count: ${initialTeachers.length}`);
    } catch (e) {
        console.error('❌ GET /teachers failed:', e.message);
        return;
    }

    // 2. POST (Create)
    let newTeacherId;
    try {
        const newTeacher = {
            name: "Test Teacher",
            subject: "Testing",
            email: "test@example.com",
            phone: "1234567890",
            bio: "A test teacher."
        };
        const res = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newTeacher)
        });
        if (!res.ok) throw new Error(`POST / failed: ${res.status}`);
        const created = await res.json();
        newTeacherId = created.id;
        console.log(`✅ POST /teachers passed. New ID: ${newTeacherId}`);
    } catch (e) {
        console.error('❌ POST /teachers failed:', e.message);
        return;
    }

    // 3. PUT (Update)
    try {
        const updates = { subject: "Advanced Testing" };
        const res = await fetch(`${API_URL}/${newTeacherId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates)
        });
        if (!res.ok) throw new Error(`PUT /${newTeacherId} failed: ${res.status}`);
        const updated = await res.json();
        if (updated.subject !== "Advanced Testing") throw new Error("Update did not persist");
        console.log(`✅ PUT /teachers/${newTeacherId} passed.`);
    } catch (e) {
        console.error(`❌ PUT /teachers/${newTeacherId} failed:`, e.message);
    }

    // 4. DELETE
    try {
        const res = await fetch(`${API_URL}/${newTeacherId}`, { method: 'DELETE' });
        if (!res.ok) throw new Error(`DELETE /${newTeacherId} failed: ${res.status}`);
        console.log(`✅ DELETE /teachers/${newTeacherId} passed.`);
    } catch (e) {
        console.error(`❌ DELETE /teachers/${newTeacherId} failed:`, e.message);
    }

    console.log('🎉 All tests completed.');
}

testTeachersApi();
