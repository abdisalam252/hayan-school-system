const http = require('http');

function makeRequest(path, method = 'GET', body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5002,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve({ statusCode: res.statusCode, data: data });
      });
    });

    req.on('error', (e) => {
      reject(e);
    });

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function test() {
  try {
    console.log("Testing Teachers API...");
    const teachers = await makeRequest('/api/teachers');
    console.log(`GET /api/teachers: ${teachers.statusCode}`);
    if (teachers.statusCode !== 200) {
      console.error("Failed to get teachers:", teachers.data);
    } else {
        console.log("Teachers data length:", JSON.parse(teachers.data).length);
    }

    console.log("\nTesting Finance API...");
    const finance = await makeRequest('/api/finance');
    console.log(`GET /api/finance: ${finance.statusCode}`);
    if (finance.statusCode !== 200) {
      console.error("Failed to get finance:", finance.data);
    } else {
        console.log("Finance data length:", JSON.parse(finance.data).length);
    }

  } catch (e) {
    console.error("Error during test:", e.message);
  }
}

test();
