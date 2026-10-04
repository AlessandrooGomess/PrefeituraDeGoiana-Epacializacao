import http from 'http';

http.get('http://localhost:3000/api/obras', (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    const json = JSON.parse(data);
    const ifpe = json.filter(o => o.titulo.includes('Campi IFPE'));
    console.log(JSON.stringify(ifpe, null, 2));
  });
}).on('error', (err) => {
  console.log("Error: " + err.message);
});
