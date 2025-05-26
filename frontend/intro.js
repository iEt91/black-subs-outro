fetch('/subscribers')
  .then(res => res.json())
  .then(data => {
    const crawl = document.getElementById('crawl');
    if (!data.subscribers || data.subscribers.length === 0) {
      crawl.innerHTML = '<p>No hay suscriptores disponibles.</p>';
    } else {
      crawl.innerHTML = `<h2>Gracias a nuestros suscriptores:</h2>` +
        data.subscribers.map(name => `<p>${name}</p>`).join('');
    }
  })
  .catch(err => {
    console.error('Error al obtener subs:', err);
    document.getElementById('crawl').innerHTML = '<p>Error al cargar subs.</p>';
  });
