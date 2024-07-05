$(document).ready(function () {
    
    // Graphique des adhérents
    $.get('/api/adherents', function (response) {
        const data = response.data;
        console.log('Données reçues:', data);
      
        if (!data || data.length === 0) {
            console.error('Aucune donnée reçue ou données vides.');
            return;
        }

        const labels = [...new Set(data.map(item => item.categorie))];
        console.log('Labels:', labels);

        const maleData = labels.map(label => {
            const item = data.find(d => d.categorie === label && d.sexe === 'Homme');
            return item ? item.count : 0;
        });
        console.log('Male Data:', maleData);

        const femaleData = labels.map(label => {
            const item = data.find(d => d.categorie === label && d.sexe === 'Femme');
            return item ? item.count : 0;
        });
        console.log('Female Data:', femaleData);

        if (maleData.every(val => val === 0) && femaleData.every(val => val === 0)) {
            console.error('Aucune donnée trouvée pour les catégories et les sexes spécifiés.');
            return;
        }

        const ctx = document.getElementById('adherentsChart').getContext('2d');
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    { label: 'Homme', data: maleData, backgroundColor: 'blue' },
                    { label: 'Femme', data: femaleData, backgroundColor: 'pink' }
                ]
            },
            options: {
                title: {
                    display: true,
                    text: 'Adhérents par Catégorie et Sexe'
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 10,
                        }
                    }
                }
            }
        });
    });
  
    // Graphique des montants
    $.get('/api/montants', function (response) {
      const data = response.data;
      const labels = data.map(item => item.type);
      const montants = data.map(item => item.total);
  
      const ctx = document.getElementById('montantsChart').getContext('2d');
      new Chart(ctx, {
        type: 'pie',
        data: {
          labels: labels,
          datasets: [{ data: montants, backgroundColor: ['red', 'green', 'yellow'] }]
        },
        options: {
          title: {
            display: true,
            text: 'Montants des Événements et Abonnements'
          }
        }
      });
    });

    // Graphique des paiements au fil du temps
    $.get('/api/paiements', function (response) {
      const data = response.data;
      const labels = data.map(item => item.date);
      const paiements = data.map(item => item.montant);
  
      const ctx = document.getElementById('paiementsChart').getContext('2d');
      new Chart(ctx, {
        type: 'line',
        data: {
          labels: labels,
          datasets: [{ label: 'Paiements', data: paiements, backgroundColor: 'lightblue', borderColor: 'blue', fill: false }]
        },
        options: {
          title: {
            display: true,
            text: 'Évolution des Paiements'
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                stepSize: 10,
              }
            }
          }
        }
      });
    });

    // Graphique de participation aux événements
    $.get('/api/inscriptions_evenements', function (response) {
      const data = response.data;
      const labels = [...new Set(data.map(item => item.evenement_id))];
      const counts = labels.map(label => {
        return data.filter(item => item.evenement_id === label).length;
      });

      const ctx = document.getElementById('evenementsChart').getContext('2d');
      new Chart(ctx, {
        type: 'line',
        data: {
          labels: labels,
          datasets: [{ label: 'Participants', data: counts, backgroundColor: 'lightgreen', borderColor: 'green', fill: false }]
        },
        options: {
          title: {
            display: true,
            text: 'Participation aux Événements'
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                stepSize: 10,
              }
            }
          }
        }
      });
    });

    // Graphique en barres pour adhérents par catégorie et nombre de cours suivis
    $.get('/api/adherents_cours', function (response) {
      const data = response.data;
      console.log('Données reçues pour le graphique en barres:', data);

      // Vérifier les données brutes
      if (!data || data.length === 0) {
        console.error('Aucune donnée reçue ou données vides.');
        return;
      }

      const labels = [...new Set(data.map(item => item.categorie))];
      console.log('Catégories:', labels);

      const nombreDeCoursData = labels.map(label => {
        const item = data.find(d => d.categorie === label);
        return item ? item.nombre_de_cours : 0;
      });

      console.log('Données formatées pour le graphique en barres:', nombreDeCoursData);

      const ctx = document.getElementById('coursChart').getContext('2d');
      new Chart(ctx, {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [{
            label: 'Nombre de Cours Suivis',
            data: nombreDeCoursData,
            backgroundColor: 'rgba(54, 162, 235, 0.2)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1
          }]
        },
        options: {
          title: {
            display: true,
            text: 'Adhérents par Catégorie et Nombre de Cours Suivis'
          },
          scales: {
            x: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Catégorie'
              }
            },
            y: {
              beginAtZero: true,
              ticks: {
                stepSize: 10,
              },
              title: {
                display: true,
                text: 'Nombre de Cours Suivis'
              }
            }
          }
        }
      });
    });
  
  });
