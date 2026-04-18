fetch('http://localhost:3001/api/v1/jobs/recommended/today?limit=6')
  .then((res) => res.json())
  .then((data) => {
    console.log('Response:', JSON.stringify(data, null, 2));
    process.exit(0);
  })
  .catch((err) => {
    console.error('Error fetching jobs:', err);
    process.exit(1);
  });
