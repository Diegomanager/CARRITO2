const url = 'https://iouclhdwsrnwpgisuptb.supabase.co/rest/v1/productos?select=*';
const headers = {
    'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlvdWNsaGR3c3Jud3BnaXN1cHRiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzNDA1MzcsImV4cCI6MjA2OTkxNjUzN30.pSwYpr4YiqzBv2RLQbIqTPOzvO6kF52UQbMPoXSxCVc',
    'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlvdWNsaGR3c3Jud3BnaXN1cHRiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzNDA1MzcsImV4cCI6MjA2OTkxNjUzN30.pSwYpr4YiqzBv2RLQbIqTPOzvO6kF52UQbMPoXSxCVc`
};

fetch(url, { headers })
    .then(response => response.json())
    .then(data => {
        console.log('Productos:', data);
    })
    .catch(error => {
        console.error('Error al obtener productos:', error);
    });