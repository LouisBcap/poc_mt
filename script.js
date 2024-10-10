let chart;
let isExpanded = false; // Suivre l'état du dépliage


// Function to draw the organization chart
function drawChart(dataFlattened) {
        // if (chart) {
        //     // Remove the previous chart if it exists
        //     d3.select('.chart-container').html('');
        // }
        // Utiliser les données du fichier uploadé pour générer le graphique
        chart = new d3.OrgChart()
        .container('.chart-container')
        .data(dataFlattened)
        .nodeWidth((d) => 250)
        .initialZoom(0.7)
        .nodeHeight((d) => 175)
        .childrenMargin((d) => 40)
        .compactMarginBetween((d) => 15)
        .compactMarginPair((d) => 80)
        .nodeContent(function (d, i, arr, state) {
            return `
                <div style="padding-top:30px;background-color:none;margin-left:1px;height:${d.height}px;border-radius:2px;overflow:visible">
                <div style="height:${d.height - 32}px;padding-top:0px;background-color:white;border:1px solid lightgray;">
                    <div style="margin-right:10px;margin-top:15px;float:right">${d.data.id}</div>
                    <div style="margin-top:-30px;background-color:#3AB6E3;height:10px;width:${d.width - 2}px;border-radius:1px"></div>
                    <div style="padding:20px; padding-top:35px;text-align:center">
                        <div style="color:#111672;font-size:16px;font-weight:bold"> ${d.data.name} </div>
                        <div style="color:#404040;font-size:16px;margin-top:4px"> ${d.data.positionName} </div>
                        <div style="color:#888888;font-size:14px;margin-top:4px"> Niveau : ${d.depth} </div> <!-- Afficher le niveau -->
                    </div> 
                    <div style="display:flex;justify-content:space-between;padding-left:15px;padding-right:15px;">
                        <div> Dirige:  ${d.data._directSubordinates} 👤</div>  
                        <div> Supervise: ${d.data._totalSubordinates} 👤</div>  
                    </div>
                    </div>     
                </div>`;
        })
        .render();

        // Afficher les boutons après l'upload
        const levelDropdown = document.getElementById('level-dropdown');
        if (levelDropdown) {
            levelDropdown.style.display = 'inline-block';
        }
        
        const toggleNodes = document.getElementById('toggle-nodes');
        if (toggleNodes) {
            toggleNodes.style.display = 'inline-block';
        }
        
        const exportPdf = document.getElementById('export-pdf');
        if (exportPdf) {
            exportPdf.style.display = 'inline-block';
        }
        
        const exportSvg = document.getElementById('export-svg');
        if (exportSvg) {
            exportSvg.style.display = 'inline-block';
        }
        
        const exportPng = document.getElementById('export-png');
        if (exportPng) {
            exportPng.style.display = 'inline-block';
    }
}

// Fonction pour déplier ou réduire tous les nœuds
document.getElementById('toggle-nodes').addEventListener('click', function () {
    if (!chart){ 
        return;
    }  // S'assurer que le graphique est chargé
    isExpanded = !isExpanded;

    if (isExpanded) {
        chart.expandAll(); // Déplier tous les nœuds
        document.getElementById('toggle-nodes').innerText = 'Réduire tout';
    } else {
        chart.collapseAll(); // Réduire tous les nœuds
        document.getElementById('toggle-nodes').innerText = 'Déplier tout';
    }
});

// Fonction pour exporter l'organigramme au format PDF
document.getElementById('export-pdf').addEventListener('click', function () {
    const element = document.querySelector('.chart-container');
    const elementWidth = element.scrollWidth;
    const elementHeight = element.scrollHeight;

    const opt = {
        margin: 0,
        filename: 'organigramme.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'px', format: [elementWidth, elementHeight] }
    };

    html2pdf().from(element).set(opt).save();
});

// Fonction pour exporter l'organigramme au format SVG
document.getElementById('export-svg').addEventListener('click', function () {
    const svgElement = document.querySelector('.chart-container svg');
    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svgElement);
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'organigramme.svg';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
});

// Fonction pour exporter l'organigramme au format PNG
document.getElementById('export-png').addEventListener('click', function () {
    html2canvas(document.querySelector('.chart-container')).then(function (canvas) {
        const pngData = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = pngData;
        link.download = 'organigramme.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });
});

// Function to upload the file and fetch the processed data
document.getElementById('upload').addEventListener('change', function (event) {
    let file = event.target.files[0];
    if (file) {
        let formData = new FormData();
        formData.append('file', file);

        // Upload file to Flask backend
        fetch('http://localhost:5000/upload', {
            method: 'POST',
            body: formData
        })
            .then(response => response.json())
            .then(data => {
                // Draw chart with the processed data
                drawChart(data);
            })
            .catch(error => console.error('Error uploading file:', error));
    }
});
